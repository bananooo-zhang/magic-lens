/**
 * 处理上传的图片文件
 * 如果是 HEIC/HEIF 格式，自动转换为 JPEG
 * 返回 Base64 字符串
 */
export async function processImageUpload(file: File): Promise<string> {
  let processedFile = file;

  // Check if file is HEIC
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    console.log('🔄 Detected HEIC image, converting to JPEG...');
    try {
      // Dynamic import with compatibility check for different bundlers
      const heic2anyModule = await import('heic2any');
      const heic2any = heic2anyModule.default || heic2anyModule;
      
      // Ensure heic2any is a function
      if (typeof heic2any !== 'function') {
        throw new Error('HEIC converter library failed to load');
      }

      const blob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8,
      });
      
      // heic2any returns a Blob or Blob[], ensure we get a Blob
      const resultBlob = Array.isArray(blob) ? blob[0] : blob;
      processedFile = new File([resultBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      
    } catch (clientError: any) {
      console.warn('⚠️ Client-side HEIC conversion failed, trying server-side fallback...', clientError);
      
      // Fallback: Server-side conversion (sharp)
      // Note: Vercel serverless function body size limit is 4.5MB
      if (file.size < 4.5 * 1024 * 1024) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/convert-heic', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Server status ${response.status}`);
          }

          const data = await response.json();
          if (data.image) {
            return data.image; // Return the base64 from server directly
          }
        } catch (serverError) {
          console.error('❌ Server-side HEIC conversion also failed:', serverError);
        }
      } else {
        console.warn('⚠️ File too large for server fallback (>4.5MB)');
      }

      // If all fails, throw error
      throw new Error(`HEIC 图片转换失败。原因可能是：1. 网络无法加载解码器；2. 图片过大(>4.5MB)。建议您先在手机上转为 JPG 后再上传。`);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(processedFile);
  });
}

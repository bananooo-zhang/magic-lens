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
    let lastError = '';

    // 1. Try Client-side conversion
    try {
      const heic2anyModule = await import('heic2any');
      const heic2any = heic2anyModule.default || heic2anyModule;
      
      if (typeof heic2any !== 'function') throw new Error('HEIC lib not loaded');

      const blob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8,
      });
      
      const resultBlob = Array.isArray(blob) ? blob[0] : blob;
      processedFile = new File([resultBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      
      // If client side success, verify file readiness
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') resolve(e.target.result);
          else reject(new Error('Failed to read converted file'));
        };
        reader.onerror = reject;
        reader.readAsDataURL(processedFile);
      });

    } catch (clientError: any) {
      console.warn('⚠️ Client-side conversion failed:', clientError);
      lastError = `客户端转换失败(${clientError.message})`;
    }

    // 2. Fallback: Server-side conversion (sharp)
    // Vercel limit is 4.5MB. We leave some buffer for headers.
    if (file.size < 4 * 1024 * 1024) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/convert-heic', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Server Error ${response.status}: ${errText.substring(0, 50)}`);
        }

        const data = await response.json();
        if (data.image) {
          return data.image; // Success!
        }
      } catch (serverError: any) {
        console.error('❌ Server-side conversion failed:', serverError);
        lastError += ` -> 服务端转换失败(${serverError.message})`;
      }
    } else {
      lastError += ` -> 图片过大(${Math.round(file.size/1024/1024*10)/10}MB)无法使用云端转换`;
    }

    // If we reached here, both failed
    throw new Error(`HEIC 图片处理失败。\n调试信息：${lastError}。\n\n建议：请在相册中截图该图片（截图自动为JPG）后上传。`);
  }

  // Normal image processing
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

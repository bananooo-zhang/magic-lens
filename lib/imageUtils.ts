import heic2any from 'heic2any';

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
      const blob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8,
      });
      
      // heic2any returns a Blob or Blob[], ensure we get a Blob
      const resultBlob = Array.isArray(blob) ? blob[0] : blob;
      processedFile = new File([resultBlob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
    } catch (error) {
      console.error('❌ HEIC conversion failed:', error);
      throw new Error('HEIC 图片转换失败，请尝试上传 JPG 或 PNG 格式。');
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

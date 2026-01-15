import { NextResponse } from 'next/server';
import convert from 'heic-convert';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`🖼️ Processing HEIC file: ${file.name}, size: ${buffer.length} bytes`);

    // Use heic-convert (WASM) instead of sharp (System Lib)
    // This is slower but much more compatible with newer iOS HEIC formats
    // heic-convert returns an ArrayBuffer or Buffer
    const resultBuffer = await convert({
      buffer: buffer, 
      format: 'JPEG',      
      quality: 0.8         
    });

    // Convert ArrayBuffer/Buffer to Base64
    const base64 = `data:image/jpeg;base64,${Buffer.from(resultBuffer).toString('base64')}`;

    return NextResponse.json({ image: base64 });

  } catch (error: any) {
    console.error('Server-side HEIC conversion failed:', error);
    return NextResponse.json(
      { error: `Conversion failed: ${error.message}` },
      { status: 500 }
    );
  }
}

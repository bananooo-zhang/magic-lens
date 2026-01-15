import { NextResponse } from 'next/server';
import sharp from 'sharp';

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

    // Use sharp to convert to JPEG
    const jpegBuffer = await sharp(buffer)
      .toFormat('jpeg', { quality: 80 })
      .toBuffer();

    // Return as Base64 JSON (to be consistent with client logic expecting a string)
    // Or return blob? Let's return JSON with base64 to match our imageUtils flow easily.
    const base64 = `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;

    return NextResponse.json({ image: base64 });

  } catch (error: any) {
    console.error('Server-side HEIC conversion failed:', error);
    return NextResponse.json(
      { error: `Conversion failed: ${error.message}` },
      { status: 500 }
    );
  }
}

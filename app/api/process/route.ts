import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { APP_CONFIG } from '@/config/app.config';

// Initialize OpenAI Client with Kapon config
const client = new OpenAI({
  baseURL: APP_CONFIG.api.baseUrl,
  apiKey: process.env.GEMINI_API_KEY,
  dangerouslyAllowBrowser: false, // Server side only
});

export const maxDuration = 60; // Allow 60s for image generation

export async function POST(req: Request) {
  try {
    const { image, prompt } = await req.json();

    if (!image || !prompt) {
      return NextResponse.json({ error: "Missing image or prompt" }, { status: 400 });
    }

    console.log("🚀 Starting AI processing...");

    // Call Gemini via OpenAI Compatible Endpoint
    const response = await client.chat.completions.create({
      model: APP_CONFIG.api.model, // gemini-3-pro-image-preview
      messages: [
        {
          role: "system",
          content: APP_CONFIG.systemPrompt // Inject aesthetic constraints
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { 
              type: "image_url", 
              image_url: { 
                url: image, // Base64 or URL
                detail: "high"
              } 
            }
          ]
        }
      ],
      max_tokens: 1024,
    });

    const aiContent = response.choices[0]?.message?.content || "";
    console.log("🤖 AI Response received:", aiContent.substring(0, 100) + "...");

    // Parse Image URL from Markdown
    // Gemini usually returns: "Here is the image: ![alt](https://...)" or just the link
    // Regex to find markdown image syntax: ![...](url)
    const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
    const urlRegex = /(https?:\/\/[^\s)]+)/; // Fallback to find any http link

    let imageUrl = null;
    
    const mdMatch = aiContent.match(markdownImageRegex);
    if (mdMatch && mdMatch[1]) {
      imageUrl = mdMatch[1];
    } else {
      // Fallback: look for raw URL
      const urlMatch = aiContent.match(urlRegex);
      if (urlMatch && urlMatch[0]) {
        imageUrl = urlMatch[0];
      }
    }

    if (!imageUrl) {
      console.error("❌ No image found in response");
      return NextResponse.json({ error: "AI processed the request but did not return an image. Response: " + aiContent }, { status: 500 });
    }

    // Since we want to persist this in our "ImageStack" which expects Base64 (to avoid expiring URLs),
    // we should ideally download it and convert to Base64.
    // Kapon/Gemini generated URLs might be temporary or public. 
    // For V1, let's proxy it to avoid CORS issues and convert to Base64.
    
    console.log("⬇️ Fetching generated image to convert to Base64...");
    const imageRes = await fetch(imageUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${imageRes.headers.get('content-type') || 'image/png'};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      image: base64Image,
      message: aiContent
    });

  } catch (error: any) {
    console.error("🔥 API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

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
    const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
    const urlRegex = /(https?:\/\/[^\s)]+)/; 

    let imageUrl = null;
    
    const mdMatch = aiContent.match(markdownImageRegex);
    if (mdMatch && mdMatch[1]) {
      imageUrl = mdMatch[1];
    } else {
      const urlMatch = aiContent.match(urlRegex);
      if (urlMatch && urlMatch[0]) {
        imageUrl = urlMatch[0];
      }
    }

    if (!imageUrl) {
      console.error("❌ No image found in response");
      return NextResponse.json({ error: "AI processed the request but did not return an image. Response: " + aiContent }, { status: 500 });
    }

    // Optimization: Directly return URL to client to avoid server timeout.
    // The client will handle display and optional conversion.
    return NextResponse.json({
      image: imageUrl, // Return URL directly
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

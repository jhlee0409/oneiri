import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";
import { callGemini, type GeminiResponse } from "@/lib/server/gemini";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dreamId, imagePrompt } = (await request.json()) as {
      dreamId?: string;
      imagePrompt?: string;
    };
    if (!dreamId || !imagePrompt) {
      return NextResponse.json(
        { error: "dreamId and imagePrompt are required" },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const supabase = createAdminClient();
    const optimizedPrompt = `Create a dreamlike, artistic image based on this description: ${imagePrompt}. Style: surreal, ethereal, dreamy atmosphere with soft lighting and mystical elements. High quality, detailed, photorealistic rendering.`;

    const geminiResponse = await callGemini(
      "gemini-2.0-flash-preview-image-generation",
      geminiApiKey,
      {
        contents: [{ parts: [{ text: optimizedPrompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          temperature: 0.7,
          topK: 32,
          topP: 1,
        },
      }
    );
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API Error Response:", errorText);
      return NextResponse.json(
        {
          error: "Failed to generate image",
          details: `Gemini API returned ${geminiResponse.status}: ${errorText}`,
        },
        { status: 500 }
      );
    }

    const geminiData = (await geminiResponse.json()) as GeminiResponse;
    if (geminiData.error) {
      console.error("Gemini API returned error:", geminiData.error);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiData.error.message}` },
        { status: 500 }
      );
    }

    const candidate = geminiData.candidates?.[0];
    if (!candidate) {
      console.error("No candidates found in response");
      return NextResponse.json(
        { error: "No candidates found in response" },
        { status: 500 }
      );
    }

    const inlineData = candidate.content?.parts?.find((part) => part.inlineData)?.inlineData;
    if (!inlineData) {
      console.error("No image data found in response parts");
      return NextResponse.json(
        { error: "No image data found in response" },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(inlineData.data, "base64");
    const filePath = `images/dream-${dreamId}-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("dream-images")
      .upload(filePath, imageBuffer, { contentType: "image/png", upsert: false });
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image to storage", details: uploadError.message },
        { status: 500 }
      );
    }

    const imageUrl = supabase.storage.from("dream-images").getPublicUrl(filePath)
      .data.publicUrl;

    const { error: updateError } = await supabase
      .from("dreams")
      .update({ generated_image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq("id", dreamId)
      .eq("user_id", user.id);
    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update dream record", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Image generated and saved successfully",
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

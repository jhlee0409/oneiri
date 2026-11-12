import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";
import { DAILY_WEAVING_LIMIT, getKstNow } from "@/lib/server/kst";
import { callGemini, type GeminiResponse } from "@/lib/server/gemini";

export const maxDuration = 60;

interface GeneratedContent {
  story_title?: string;
  story_content?: string;
  image_prompt?: string;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function safeParseJSON(text: string): GeneratedContent {
  let cleanText = text
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");

  const jsonMatch = cleanText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    cleanText = jsonMatch[1].trim();
  } else if (cleanText.includes("{") && cleanText.includes("}")) {
    const start = cleanText.indexOf("{");
    const end = cleanText.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      cleanText = cleanText.substring(start, end + 1);
    }
  }

  cleanText = cleanText
    .replace(/,(\s*[}\]])/g, "$1")
    .replace(/([^\\])\\(?!["\\/bfnrt])/g, "$1\\\\");
  return JSON.parse(cleanText) as GeneratedContent;
}

function generateImagePrompt({
  coreScene,
  mood,
  emotion,
  characters,
  objects,
  keywords,
}: {
  coreScene: string;
  mood: string;
  emotion: string;
  characters?: string;
  objects?: string;
  keywords?: string[];
}): string {
  let prompt = `A cinematic, atmospheric photo capturing a surreal dream from a first-person perspective. The main scene is: "${coreScene.replace(/["']/g, "")}".`;
  if (characters && characters.trim()) {
    prompt += ` A key figure, described as '${characters}', is central to the scene.`;
  }
  if (objects && objects.trim()) {
    prompt += ` A significant object, '${objects}', is prominently featured, glowing with a soft, inner light.`;
  }
  prompt += ` The overall atmosphere is intensely ${mood} and charged with a deep feeling of '${emotion}'. This is visually expressed through dramatic lighting, a color palette dominated by deep teals and warm golds, and an ethereal, dreamlike quality with soft focus and swirling mist.`;
  if (keywords && keywords.length > 0) {
    prompt += ` Key visual motifs include: ${keywords.join(", ")}.`;
  }
  prompt += ` Hyper-detailed, epic composition, cinematic lighting. No visible text, captions, or signage.`;
  return prompt;
}

export async function POST(request: Request) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("필수 환경 변수가 설정되지 않았습니다.");
    }

    if (!request.headers.get("authorization")) {
      return NextResponse.json(
        {
          error: "인증이 필요합니다",
          oneiri_message: "별빛 서재에 입장하려면 먼저 인증이 필요해요. 🌟",
        },
        { status: 401 }
      );
    }
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "유효하지 않은 인증 토큰입니다",
          oneiri_message:
            "별빛이 흐려져 서재에 들어갈 수 없어요. 다시 시도해주세요. ✨",
        },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    const rawData = (await request.json()) as Record<string, unknown>;
    const dreamInputText = str(rawData.dreamInputText) || str(rawData.dream_input_text);
    if (!dreamInputText || dreamInputText.trim().length < 5) {
      return NextResponse.json(
        {
          error: "꿈 내용을 5글자 이상 입력해주세요",
          oneiri_message: "꿈의 이야기를 조금 더 자세히 들려주세요. 🌟",
        },
        { status: 400 }
      );
    }

    const keywords = rawData.dreamKeywords || rawData.dream_keywords;
    const requestData = {
      dreamInputText: dreamInputText.trim(),
      dreamKeywords: Array.isArray(keywords) ? (keywords as string[]) : undefined,
      dreamEmotion: str(rawData.dreamEmotion) || str(rawData.dream_emotion),
      storyPreferenceGenre:
        str(rawData.storyPreferenceGenre) || str(rawData.story_preference_genre),
      storyPreferenceLength:
        str(rawData.storyPreferenceLength) || str(rawData.story_preference_length),
      storyPreferenceMood:
        str(rawData.storyPreferenceMood) || str(rawData.story_preference_mood),
      dreamCharacters: str(rawData.dreamCharacters) || str(rawData.dream_characters),
      dreamObjects: str(rawData.dreamObjects) || str(rawData.dream_objects),
    };

    const { kstDateString } = getKstNow();

    const { data: countData, error: countError } = await supabase
      .from("daily_weaving_counts")
      .select("count")
      .eq("user_id", user.id)
      .eq("weaving_date", kstDateString)
      .maybeSingle();
    if (countError) {
      console.error("일일 생성 횟수 조회 실패:", countError);
      throw new Error("일일 생성 횟수 조회 중 오류가 발생했습니다.");
    }

    const currentCount: number = countData?.count || 0;
    const DAILY_LIMIT = DAILY_WEAVING_LIMIT;
    if (currentCount >= DAILY_LIMIT) {
      const { data: todayDreams } = await supabase
        .from("dreams")
        .select("id, generated_story_title, created_at")
        .eq("user_id", user.id)
        .gte("created_at", `${kstDateString}T00:00:00+09:00`)
        .lt("created_at", `${kstDateString}T23:59:59+09:00`);
      return NextResponse.json(
        {
          error: "일일 생성 한도를 초과했습니다",
          limit_reached: true,
          current_count: currentCount,
          daily_limit: DAILY_LIMIT,
          today_dreams: todayDreams || [],
          oneiri_message: `오늘은 이미 ${DAILY_LIMIT}편의 꿈을 직조하셨어요. 별빛이 내일 다시 충전될 때까지 기다려주세요. 🌟✨`,
        },
        { status: 429 }
      );
    }

    const prompt = `
You are a professional Korean storyteller and dream interpreter.  
Your sacred task is to **weave a vivid, emotional story** based solely on the user’s dream memory.  
Every detail must serve this exact memory. No unrelated elements.

---

### 📍[Step 1: The Core Dream Moment]

- Core scene: "${requestData.dreamInputText.trim().replace(/\s+/g, " ")}"
- This is the most important part of the entire story.
- Describe this scene **visually**, **sensorially**, and **emotionally**.  
- All story beats must **lead up to and revolve around this moment**.

---

### 🧩[Step 2: Supporting Context & Rules]

Use only when it enhances the core moment.

- Genre: "${requestData.storyPreferenceGenre || "현실과 상상이 혼합된 자유 형식"}"
- Mood: "${requestData.storyPreferenceMood || "중립적이고 자연스러운 분위기"}"
- Emotion: "${requestData.dreamEmotion || "구체화되지 않은 감정"}"
- Keywords: \`${requestData.dreamKeywords?.join(", ") || "묘사할 특별한 키워드 없음"}\`
- Characters: \`${requestData.dreamCharacters || ""}\`
- Objects: \`${requestData.dreamObjects || ""}\`

Do NOT add new characters or events. Do NOT deviate from the provided input.

---

### 🧱[Step 3: Style & Output Rules]

- Story must be 3~4 short paragraphs.
- Use 1st person ("나") only.
- Do not describe waking up.
- End with a **symbolic image**, **lingering emotion**, or **ambiguous impression**.
- Avoid cliché. No moral lessons. No over-explanation.

---

### 📦[Final Output Format – Korean only except image_prompt]

Respond ONLY with the following strict JSON format.

DO NOT include markdown, explanations, or any extra text.
DO NOT wrap with \`\`\`json or other syntax.

{
  "story_title": "...",
  "story_content": "...",
  "image_prompt": ${JSON.stringify(
    generateImagePrompt({
      coreScene: requestData.dreamInputText,
      mood: requestData.storyPreferenceMood || "mysterious",
      emotion: requestData.dreamEmotion || "awe",
      characters: requestData.dreamCharacters,
      objects: requestData.dreamObjects,
      keywords: requestData.dreamKeywords,
    })
  )}
}
`;

    const geminiResponse = await callGemini("gemini-2.0-flash", geminiApiKey, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    });
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API 오류 (${geminiResponse.status}): ${errorText}`);
    }

    const geminiData = (await geminiResponse.json()) as GeminiResponse;
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error("Gemini 응답 없음:", geminiData);
      throw new Error("AI 응답을 받을 수 없습니다.");
    }

    let generatedContent: GeneratedContent;
    try {
      generatedContent = safeParseJSON(responseText);
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : String(parseError);
      console.error("JSON 파싱 실패:", message, responseText.substring(0, 500));
      return NextResponse.json(
        {
          error: "AI 응답 처리 중 오류가 발생했습니다",
          oneiri_message: "꿈의 실이 엉켜버렸어요. 다시 한번 시도해주세요. 🧶✨",
          debug_info: {
            error_message: message,
            response_preview: responseText.substring(0, 200),
            response_length: responseText.length,
          },
        },
        { status: 500 }
      );
    }

    if (!generatedContent?.story_title || !generatedContent?.story_content) {
      throw new Error("생성된 내용이 불완전합니다.");
    }

    const newCount = currentCount + 1;
    await supabase.from("daily_weaving_counts").upsert(
      { user_id: user.id, weaving_date: kstDateString, count: newCount },
      { onConflict: "user_id, weaving_date" }
    );

    const dreamData = {
      user_id: user.id,
      dream_input_text: requestData.dreamInputText,
      dream_keywords: requestData.dreamKeywords,
      dream_emotion: requestData.dreamEmotion,
      story_preference_genre: requestData.storyPreferenceGenre,
      story_preference_length: requestData.storyPreferenceLength,
      story_preference_mood: requestData.storyPreferenceMood,
      generated_story_title: generatedContent.story_title,
      generated_story_content: generatedContent.story_content,
      generated_image_prompt: generatedContent.image_prompt || "",
      processing_status: "completed",
      generated_at: new Date().toISOString(),
      raw_gemini_response: geminiData,
    };

    const { data: insertedDream, error: insertError } = await supabase
      .from("dreams")
      .insert(dreamData)
      .select()
      .single();
    if (insertError) {
      console.error("꿈 저장 실패:", insertError);
      throw new Error("이야기 저장 중 오류가 발생했습니다.");
    }

    return NextResponse.json({
      success: true,
      dream: insertedDream,
      daily_status: {
        current_count: newCount,
        daily_limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT - newCount,
      },
      oneiri_message: `새로운 꿈이 별빛으로 직조되었어요! 오늘 ${DAILY_LIMIT - newCount}편 더 만들 수 있어요. ✨🌙`,
    });
  } catch (error) {
    console.error("꿈 직조 오류:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        oneiri_message:
          "별빛 마법에 예상치 못한 문제가 생겼어요. 잠시 후 다시 시도해주세요. 🌟",
      },
      { status: 500 }
    );
  }
}

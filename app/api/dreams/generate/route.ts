import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";
import { DAILY_WEAVING_LIMIT, getKstNow } from "@/lib/server/kst";
import { DreamStoryError, generateDreamStory } from "@/lib/server/dream-story";

export const maxDuration = 60;

function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
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

    let story;
    try {
      story = await generateDreamStory(requestData, geminiApiKey);
    } catch (storyError) {
      if (!(storyError instanceof DreamStoryError)) throw storyError;
      console.error("꿈 이야기 생성 실패:", storyError.message);
      return NextResponse.json(
        {
          error: "AI 응답 처리 중 오류가 발생했습니다",
          oneiri_message: "꿈의 실이 엉켜버렸어요. 다시 한번 시도해주세요. 🧶✨",
        },
        { status: 502 }
      );
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
      generated_story_title: story.storyTitle,
      generated_story_content: story.storyContent,
      generated_image_prompt: story.imagePrompt,
      processing_status: "completed",
      generated_at: new Date().toISOString(),
      raw_gemini_response: story.rawResponse,
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

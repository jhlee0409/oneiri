import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";
import { DreamStoryError, generateDreamStory } from "@/lib/server/dream-story";
import { parseDreamRequest } from "@/lib/server/dream-request";
import { GUEST_DREAM_MAX_LENGTH } from "@/lib/guest-dream";

export const maxDuration = 60;

const GUEST_MAX_BODY_BYTES = 24 * 1024;
const GUEST_MAX_OPTION_LENGTH = 200;
const GUEST_MAX_KEYWORDS = 20;
const GUEST_MAX_KEYWORD_LENGTH = 64;

async function readGuestBody(request: Request): Promise<string | null> {
  if (!request.body) return "";
  if (Number(request.headers.get("content-length")) > GUEST_MAX_BODY_BYTES) return null;

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return body + decoder.decode();

      bytes += value.byteLength;
      // Cancelling a Node request stream can destroy the socket before the 413 is sent.
      if (bytes > GUEST_MAX_BODY_BYTES) return null;
      body += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

function getClientIp(request: Request): string | null {
  if (process.env.NODE_ENV !== "production") return "127.0.0.1";
  if (process.env.VERCEL !== "1") return null;

  const ip = request.headers.get("x-vercel-forwarded-for")?.trim();
  return ip && isIP(ip) !== 0 ? ip : null;
}

export async function POST(request: Request) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const ipSalt = process.env.GUEST_IP_SALT;
    if (!geminiApiKey || !ipSalt) {
      throw new Error("필수 환경 변수가 설정되지 않았습니다.");
    }

    if (request.headers.get("authorization") && (await getUserFromRequest(request))) {
      return NextResponse.json(
        {
          error: "로그인한 사용자는 /api/dreams/generate 를 사용해야 합니다",
          oneiri_message: "이미 별빛 서재에 들어와 계시네요. 서재에서 꿈을 엮어주세요.",
        },
        { status: 400 }
      );
    }

    const body = await readGuestBody(request);
    if (body === null) {
      return NextResponse.json(
        {
          error: "요청 본문이 너무 큽니다",
          oneiri_message: "꿈 내용과 선택 입력을 줄여 다시 시도해주세요.",
        },
        { status: 413 }
      );
    }
    const rawData = JSON.parse(body) as Record<string, unknown>;
    const requestData = parseDreamRequest(rawData);
    if (!requestData) {
      return NextResponse.json(
        {
          error: "꿈 내용을 5글자 이상 입력해주세요",
          oneiri_message: "꿈의 이야기를 조금 더 자세히 들려주세요.",
        },
        { status: 400 }
      );
    }
    if (requestData.dreamInputText.length > GUEST_DREAM_MAX_LENGTH) {
      return NextResponse.json(
        {
          error: `꿈 내용은 ${GUEST_DREAM_MAX_LENGTH}자 이하로 입력해주세요`,
          oneiri_message: `체험에서는 ${GUEST_DREAM_MAX_LENGTH}자까지의 꿈 조각을 엮을 수 있어요.`,
        },
        { status: 400 }
      );
    }
    const { dreamKeywords } = requestData;
    const options = [
      requestData.dreamEmotion,
      requestData.storyPreferenceGenre,
      requestData.storyPreferenceMood,
      requestData.storyPreferenceLength,
      requestData.dreamCharacters,
      requestData.dreamObjects,
    ];
    if (
      options.some((option) => option !== undefined && option.length > GUEST_MAX_OPTION_LENGTH) ||
      (dreamKeywords &&
        (dreamKeywords.length > GUEST_MAX_KEYWORDS ||
          dreamKeywords.some((keyword) => keyword.length > GUEST_MAX_KEYWORD_LENGTH)))
    ) {
      return NextResponse.json(
        {
          error: "꿈의 선택 입력이 허용 범위를 초과했습니다",
          oneiri_message: `키워드는 ${GUEST_MAX_KEYWORDS}개까지, 각 ${GUEST_MAX_KEYWORD_LENGTH}자 이하로 입력해주세요. 다른 선택 입력은 ${GUEST_MAX_OPTION_LENGTH}자까지 쓸 수 있어요.`,
        },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    if (!ip) {
      console.error("게스트 생성 요청에 신뢰할 수 있는 IP가 없습니다.");
      throw new Error("게스트 생성 횟수 조회 중 오류가 발생했습니다.");
    }

    const supabase = createAdminClient();
    const ipHash = createHash("sha256").update(ipSalt + ip).digest("hex");
    const { data: reservation, error: reservationError } = await supabase.rpc(
      "reserve_guest_dream_quota",
      { p_ip_hash: ipHash }
    );
    if (reservationError) {
      console.error("게스트 생성 횟수 예약 실패:", reservationError.code);
      throw new Error("게스트 생성 횟수 조회 중 오류가 발생했습니다.");
    }

    if (reservation === "ip_limit") {
      return NextResponse.json(
        {
          error: "오늘의 체험 이야기를 이미 만들었습니다",
          limit_reached: true,
          oneiri_message:
            "오늘의 체험 이야기는 이미 엮어졌어요. Google로 로그인하면 매일 두 편의 꿈을 서재에 담을 수 있어요.",
        },
        { status: 429 }
      );
    }
    if (reservation === "global_limit") {
      return NextResponse.json(
        {
          error: "오늘의 게스트 체험이 모두 마감되었습니다",
          oneiri_message:
            "오늘 밤 체험의 별빛이 모두 소진되었어요. Google로 로그인하면 바로 꿈을 엮을 수 있어요.",
        },
        { status: 429 }
      );
    }
    if (reservation !== "reserved") {
      console.error("게스트 생성 횟수 예약 결과를 확인할 수 없습니다.");
      throw new Error("게스트 생성 횟수 조회 중 오류가 발생했습니다.");
    }

    let story;
    try {
      story = await generateDreamStory(requestData, geminiApiKey, "guest");
    } catch (storyError) {
      if (!(storyError instanceof DreamStoryError)) throw storyError;
      console.error("게스트 꿈 이야기 생성 실패:", storyError.message);
      return NextResponse.json(
        {
          error: "AI 응답 처리 중 오류가 발생했습니다",
          oneiri_message: "꿈의 실이 엉켜버렸어요. 다시 한번 시도해주세요.",
        },
        { status: 502 }
      );
    }

    const { data: guestDream, error: insertError } = await supabase
      .from("guest_dreams")
      .insert({
        ip_hash: ipHash,
        dream_input_text: requestData.dreamInputText,
        dream_keywords: requestData.dreamKeywords,
        dream_emotion: requestData.dreamEmotion,
        story_preference_genre: requestData.storyPreferenceGenre,
        story_preference_mood: requestData.storyPreferenceMood,
        generated_story_title: story.storyTitle,
        generated_story_content: story.storyContent,
        generated_image_prompt: story.imagePrompt,
        raw_gemini_response: story.rawResponse,
      })
      .select("id, generated_story_title, generated_story_content")
      .single();
    if (insertError) {
      console.error("게스트 꿈 저장 실패:", insertError);
      throw new Error("이야기 저장 중 오류가 발생했습니다.");
    }

    return NextResponse.json({ success: true, guest_dream: guestDream });
  } catch (error) {
    console.error("게스트 꿈 직조 오류:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        oneiri_message:
          "별빛 마법에 예상치 못한 문제가 생겼어요. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}

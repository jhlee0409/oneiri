import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";
import { GUEST_DREAM_CLAIM_TTL_MS } from "@/lib/guest-dream";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 로그인 전 게스트로 만든 꿈 이야기를 로그인한 사용자의 서재로 옮긴다. 일일 생성 한도에 포함되지 않는다. */
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "인증이 필요합니다",
          oneiri_message: "별빛 서재에 입장하려면 먼저 인증이 필요해요. 🌟",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { guestDreamId?: unknown };
    const guestDreamId = body.guestDreamId;
    if (typeof guestDreamId !== "string" || !UUID_PATTERN.test(guestDreamId)) {
      return NextResponse.json({ error: "guestDreamId가 올바르지 않습니다" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("guest_dreams")
      .select("created_at, claimed_by, claimed_dream_id")
      .eq("id", guestDreamId)
      .maybeSingle();
    if (fetchError) {
      console.error("게스트 꿈 조회 실패:", fetchError);
      throw new Error("체험 이야기 조회 중 오류가 발생했습니다.");
    }
    if (!existing) {
      return NextResponse.json({ error: "체험 이야기를 찾을 수 없습니다" }, { status: 404 });
    }
    if (existing.claimed_by) {
      if (existing.claimed_by === user.id && existing.claimed_dream_id) {
        return NextResponse.json({ success: true, dreamId: existing.claimed_dream_id });
      }
      return NextResponse.json({ error: "이미 서재로 옮겨진 이야기입니다" }, { status: 409 });
    }
    if (Date.now() - new Date(existing.created_at).getTime() > GUEST_DREAM_CLAIM_TTL_MS) {
      return NextResponse.json({ error: "보관 기간이 지난 체험 이야기입니다" }, { status: 410 });
    }

    const claimedAt = new Date().toISOString();
    const { data: guestDream, error: claimError } = await supabase
      .from("guest_dreams")
      .update({ claimed_by: user.id, claimed_at: claimedAt })
      .eq("id", guestDreamId)
      .is("claimed_by", null)
      .select()
      .maybeSingle();
    if (claimError) {
      console.error("게스트 꿈 claim 실패:", claimError);
      throw new Error("체험 이야기를 옮기는 중 오류가 발생했습니다.");
    }
    if (!guestDream) {
      // 동시에 들어온 다른 요청이 먼저 가져갔다.
      return NextResponse.json({ error: "이미 서재로 옮겨진 이야기입니다" }, { status: 409 });
    }

    const { data: dream, error: insertError } = await supabase
      .from("dreams")
      .insert({
        user_id: user.id,
        dream_input_text: guestDream.dream_input_text,
        dream_keywords: guestDream.dream_keywords,
        dream_emotion: guestDream.dream_emotion,
        story_preference_genre: guestDream.story_preference_genre,
        story_preference_mood: guestDream.story_preference_mood,
        generated_story_title: guestDream.generated_story_title,
        generated_story_content: guestDream.generated_story_content,
        generated_image_prompt: guestDream.generated_image_prompt,
        processing_status: "completed",
        generated_at: guestDream.created_at,
        raw_gemini_response: guestDream.raw_gemini_response,
      })
      .select("id")
      .single();
    if (insertError) {
      console.error("claim한 꿈 저장 실패:", insertError);
      // 다음 시도에서 다시 옮길 수 있도록 claim을 되돌린다.
      await supabase
        .from("guest_dreams")
        .update({ claimed_by: null, claimed_at: null })
        .eq("id", guestDreamId)
        .eq("claimed_by", user.id);
      throw new Error("이야기 저장 중 오류가 발생했습니다.");
    }

    const { error: linkError } = await supabase
      .from("guest_dreams")
      .update({ claimed_dream_id: dream.id })
      .eq("id", guestDreamId);
    if (linkError) {
      // 꿈은 이미 서재에 있다. 연결 실패는 재시도 시 409로만 이어진다.
      console.error("게스트 꿈 연결 실패:", linkError);
    }

    return NextResponse.json({ success: true, dreamId: dream.id });
  } catch (error) {
    console.error("게스트 꿈 claim 오류:", error);
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

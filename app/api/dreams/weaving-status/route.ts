import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";
import { DAILY_WEAVING_LIMIT, getKstNow } from "@/lib/server/kst";

export async function GET(request: Request) {
  try {
    if (!request.headers.get("authorization")) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
          error: "유효하지 않은 인증 토큰입니다",
          oneiri_message:
            "별빛이 흐려져 서재에 들어갈 수 없어요. 다시 시도해주세요. ✨",
        },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    const { kstTime, kstDateString } = getKstNow();

    const { data: countData } = await supabase
      .from("daily_weaving_counts")
      .select("count")
      .eq("user_id", user.id)
      .eq("weaving_date", kstDateString)
      .single();
    const currentCount: number = countData ? countData.count : 0;

    const DAILY_LIMIT = DAILY_WEAVING_LIMIT;
    const remaining = Math.max(0, DAILY_LIMIT - currentCount);
    const hasReachedLimit = currentCount >= DAILY_LIMIT;

    const { data: todayDreams, error: dreamsError } = await supabase
      .from("dreams")
      .select("id, generated_story_title, created_at")
      .eq("user_id", user.id)
      .gte("created_at", `${kstDateString}T00:00:00+09:00`)
      .lt("created_at", `${kstDateString}T23:59:59+09:00`)
      .order("created_at", { ascending: false });
    if (dreamsError) {
      console.error("오늘 꿈 조회 실패:", dreamsError);
    }

    // Same calculation as the former edge function (runtime local time = UTC).
    const tomorrow = new Date(kstTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const nextReset = tomorrow.toISOString();
    const hoursUntilReset = Math.ceil(
      (tomorrow.getTime() - kstTime.getTime()) / (1000 * 60 * 60)
    );

    let oneiriMessage;
    if (hasReachedLimit) {
      oneiriMessage = {
        title: "오늘의 꿈들은 모두 완성되었어요",
        content: `오늘은 이미 ${DAILY_LIMIT}편의 아름다운 꿈을 만들었어요. 별빛이 내일 다시 충전될 때까지 기다려주세요.`,
        hours_until_reset: hoursUntilReset,
      };
    } else if (currentCount === 0) {
      oneiriMessage = {
        title: "오늘의 꿈 이야기를 기다리고 있어요",
        content: `오늘은 아직 꿈을 만들지 않았어요. ${DAILY_LIMIT}편의 아름다운 이야기를 만들 수 있어요!`,
        encouragement: "가장 사소한 꿈의 조각이 가장 특별한 이야기가 되기도 해요. ✨",
      };
    } else {
      oneiriMessage = {
        title: "더 많은 꿈을 만들 수 있어요",
        content: `오늘 ${remaining}편의 꿈을 더 만들 수 있어요. 별빛이 당신의 이야기를 기다리고 있어요!`,
        encouragement: "각 꿈의 조각이 별빛으로 변해가는 과정을 지켜보세요. ✨🌟",
      };
    }

    let nextAction: string;
    if (hasReachedLimit) {
      nextAction = "visit_library";
    } else if (remaining === 1) {
      nextAction = "create_final_dream";
    } else {
      nextAction = "create_dream";
    }

    const { count: totalDreams } = await supabase
      .from("dreams")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      data: {
        weaving_status: {
          current_count: currentCount,
          daily_limit: DAILY_LIMIT,
          remaining,
          has_reached_limit: hasReachedLimit,
          next_reset: nextReset,
          hours_until_reset: hoursUntilReset,
        },
        oneiri_message: oneiriMessage,
        todays_dreams: (todayDreams || []).map(
          (dream: { id: string; generated_story_title: string | null; created_at: string }) => ({
            id: dream.id,
            title: dream.generated_story_title || "제목 없음",
            created_at: dream.created_at,
          })
        ),
        total_dreams: totalDreams || 0,
        next_action: nextAction,
      },
    });
  } catch (error) {
    console.error("일일 꿈 생성 상태 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "서버 내부 오류가 발생했습니다",
        oneiri_message:
          "별빛 마법에 예상치 못한 문제가 생겼어요. 잠시 후 다시 시도해주세요. 🌟",
      },
      { status: 500 }
    );
  }
}

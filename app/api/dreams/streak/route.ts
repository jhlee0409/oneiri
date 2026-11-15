import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";
import { computeDreamStreak } from "@/lib/server/streak";

const PAGE_SIZE = 1000;

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    const createdAts: string[] = [];
    // PostgREST는 한 번에 최대 1000행을 돌려주므로 끝까지 나눠 읽는다.
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("dreams")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      for (const row of data) createdAts.push(row.created_at);
      if (data.length < PAGE_SIZE) break;
    }

    return NextResponse.json({ success: true, data: computeDreamStreak(createdAts) });
  } catch (error) {
    console.error("꿈 연속 기록 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "연속 기록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

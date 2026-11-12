import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";

const FALLBACK_PROFILE = { display_name: "꿈꾸는자", avatar_url: null };

export async function GET(request: Request) {
  try {
    const userId = new URL(request.url).searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json(
        { error: "user_id 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const { data: profile, error } = await createAdminClient()
      .from("user_profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("프로필 조회 오류:", error);
      return NextResponse.json(FALLBACK_PROFILE);
    }

    return NextResponse.json({
      display_name: profile?.display_name || FALLBACK_PROFILE.display_name,
      avatar_url: profile?.avatar_url || null,
    });
  } catch (error) {
    console.error("프로필 조회 오류:", error);
    return NextResponse.json(FALLBACK_PROFILE);
  }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Supabase 클라이언트 생성
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "인증되지 않은 사용자입니다." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 사용자 상태를 DELETED_PENDING으로 변경
    const { error: updateError } = await supabaseClient
      .from("user_profiles")
      .update({
        status: "DELETED_PENDING",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("프로필 업데이트 오류:", updateError);
      return new Response(
        JSON.stringify({ error: "탈퇴 처리 중 오류가 발생했습니다." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 현재 사용자의 댓글에 닉네임 스냅샷 저장
    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    if (profile?.display_name) {
      await supabaseClient
        .from("dream_comments")
        .update({
          author_nickname_snapshot: profile.display_name,
        })
        .eq("user_id", user.id)
        .is("author_nickname_snapshot", null);
    }

    // 사용자 세션 만료 처리
    await supabaseClient.auth.signOut();

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "탈퇴 요청이 접수되었습니다. 30일 후 모든 데이터가 영구 삭제됩니다.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("탈퇴 처리 오류:", error);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

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
    // URL에서 user_id 파라미터 추출
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "user_id 파라미터가 필요합니다." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Service Role Key를 사용해서 모든 사용자 프로필에 접근 가능하도록 설정
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // user_profiles에서 display_name과 avatar_url 조회
    const { data: profile, error } = await supabaseAdmin
      .from("user_profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("프로필 조회 오류:", error);
      return new Response(
        JSON.stringify({
          display_name: "꿈꾸는자",
          avatar_url: null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        display_name: profile?.display_name || "꿈꾸는자",
        avatar_url: profile?.avatar_url || null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge Function 오류:", error);
    return new Response(
      JSON.stringify({
        display_name: "꿈꾸는자",
        avatar_url: null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

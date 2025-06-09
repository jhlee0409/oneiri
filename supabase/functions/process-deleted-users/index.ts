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
    // Service Role로 Supabase 클라이언트 생성 (관리자 권한 필요)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 30일이 지난 DELETED_PENDING 상태의 사용자들 조회
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: usersToDelete, error: fetchError } = await supabaseAdmin
      .from("user_profiles")
      .select("id, display_name, deleted_at")
      .eq("status", "DELETED_PENDING")
      .lte("deleted_at", thirtyDaysAgo);

    if (fetchError) {
      console.error("사용자 조회 오류:", fetchError);
      return new Response(
        JSON.stringify({ error: "사용자 조회 중 오류가 발생했습니다." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const processedUsers = [];

    for (const user of usersToDelete || []) {
      try {
        console.log(`Processing user deletion for: ${user.id}`);

        // 1. 해당 사용자의 모든 꿈 이야기 삭제
        const { error: dreamsDeleteError } = await supabaseAdmin
          .from("dreams")
          .delete()
          .eq("user_id", user.id);

        if (dreamsDeleteError) {
          console.error(`꿈 삭제 오류 (${user.id}):`, dreamsDeleteError);
          continue;
        }

        // 2. 해당 사용자의 분석 데이터 삭제
        await supabaseAdmin
          .from("dream_analytics")
          .delete()
          .eq("user_id", user.id);

        await supabaseAdmin
          .from("daily_weaving_counts")
          .delete()
          .eq("user_id", user.id);

        await supabaseAdmin
          .from("api_usage_logs")
          .delete()
          .eq("user_id", user.id);

        await supabaseAdmin
          .from("dream_feedback")
          .delete()
          .eq("user_id", user.id);

        // 3. Auth 사용자 삭제 (이때 comments와 likes의 user_id가 자동으로 NULL이 됨)
        const { error: authDeleteError } =
          await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (authDeleteError) {
          console.error(`Auth 사용자 삭제 오류 (${user.id}):`, authDeleteError);
          continue;
        }

        // 4. 사용자 프로필 완전 삭제
        const { error: profileDeleteError } = await supabaseAdmin
          .from("user_profiles")
          .delete()
          .eq("id", user.id);

        if (profileDeleteError) {
          console.error(`프로필 삭제 오류 (${user.id}):`, profileDeleteError);
          continue;
        }

        processedUsers.push({
          id: user.id,
          display_name: user.display_name,
          deleted_at: user.deleted_at,
          processed_at: new Date().toISOString(),
        });

        console.log(`Successfully processed user deletion for: ${user.id}`);
      } catch (userError) {
        console.error(`사용자 ${user.id} 처리 중 오류:`, userError);
        continue;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${processedUsers.length}명의 사용자 데이터가 영구 삭제되었습니다.`,
        processed_users: processedUsers,
        total_candidates: usersToDelete?.length || 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("삭제 처리 전체 오류:", error);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

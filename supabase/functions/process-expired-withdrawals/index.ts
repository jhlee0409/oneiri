import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
Deno.serve(async (req)=>{
  // CORS 헤더 설정
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
  // OPTIONS 요청 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    // 서비스 역할 인증 확인 (크론 작업용)
    const authHeader = req.headers.get("Authorization");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authHeader || !authHeader.includes(serviceKey)) {
      return new Response(JSON.stringify({
        error: "Unauthorized: Service role required"
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Supabase 클라이언트 초기화
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey ?? "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('탈퇴 만료 사용자 처리 시작...');
    // 30일 경과 사용자 처리 함수 호출
    const { data, error } = await supabase.rpc('process_expired_withdrawals');
    if (error) {
      console.error('만료 탈퇴 처리 오류:', error);
      return new Response(JSON.stringify({
        error: "만료 탈퇴 처리 중 오류가 발생했습니다",
        details: error.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const processedCount = data || 0;
    console.log(`처리 완료: ${processedCount}명의 사용자 완전 삭제`);
    // 처리 결과 로그 저장
    const { error: logError } = await supabase.from('api_usage_logs').insert({
      user_id: null,
      api_provider: 'internal',
      model_used: 'process_expired_withdrawals',
      endpoint: '/process-expired-withdrawals',
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      cost_usd: 0,
      request_data: {
        processed_count: processedCount
      },
      response_data: {
        success: true,
        timestamp: new Date().toISOString()
      },
      processing_time_ms: 0,
      status: 'success'
    });
    if (logError) {
      console.warn('로그 저장 오류:', logError);
    }
    return new Response(JSON.stringify({
      success: true,
      processedCount,
      message: `${processedCount}명의 만료 탈퇴 사용자 처리 완료`,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

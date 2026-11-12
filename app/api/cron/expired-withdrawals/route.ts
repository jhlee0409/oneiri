import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized: Service role required" },
      { status: 401 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("process_expired_withdrawals");
    if (error) {
      console.error("만료 탈퇴 처리 오류:", error);
      return NextResponse.json(
        { error: "만료 탈퇴 처리 중 오류가 발생했습니다", details: error.message },
        { status: 500 }
      );
    }

    const processedCount: number = data || 0;

    const { error: logError } = await supabase.from("api_usage_logs").insert({
      user_id: null,
      api_provider: "internal",
      model_used: "process_expired_withdrawals",
      endpoint: "/process-expired-withdrawals",
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      cost_usd: 0,
      request_data: { processed_count: processedCount },
      response_data: { success: true, timestamp: new Date().toISOString() },
      processing_time_ms: 0,
      status: "success",
    });
    if (logError) {
      console.warn("로그 저장 오류:", logError);
    }

    return NextResponse.json({
      success: true,
      processedCount,
      message: `${processedCount}명의 만료 탈퇴 사용자 처리 완료`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

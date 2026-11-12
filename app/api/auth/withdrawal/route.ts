import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    if (!request.headers.get("authorization")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    let body: { confirmText?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (body.confirmText !== "탈퇴합니다") {
      return NextResponse.json(
        { error: "확인 텍스트가 일치하지 않습니다" },
        { status: 400 }
      );
    }

    const { error: transactionError } = await createAdminClient().rpc(
      "process_user_withdrawal",
      { target_user_id: user.id }
    );
    if (transactionError) {
      console.error("Withdrawal transaction error:", transactionError);
      return NextResponse.json(
        { error: "회원 탈퇴 처리 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "회원 탈퇴가 완료되었습니다",
      withdrawalDate: new Date().toISOString(),
      note: "30일 후 모든 데이터가 완전히 삭제됩니다",
    });
  } catch (error) {
    console.error("Unexpected withdrawal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

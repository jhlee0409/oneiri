import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 로그인 성공 후 탈퇴 회원 체크
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // user_profiles에서 탈퇴 상태 확인
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("status")
          .eq("id", user.id)
          .single();

        // 탈퇴된 회원이라면 로그아웃 처리 후 에러 페이지로 이동
        if (
          !profileError &&
          profile &&
          (profile.status === "DELETED_PENDING" || profile.status === "DELETED")
        ) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/login?error=withdrawn_user&message=탈퇴된 계정입니다`
          );
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";
import { AUTH_EVENT_PARAM } from "@/lib/analytics";

/** 이 시간 안에 생성된 계정의 첫 로그인은 가입으로 본다. */
const NEW_USER_WINDOW_MS = 5 * 60 * 1000;

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

      const isNewUser =
        !!user &&
        Date.now() - new Date(user.created_at).getTime() < NEW_USER_WINDOW_MS;
      const redirectPath = new URL(next, origin);
      redirectPath.searchParams.set(
        AUTH_EVENT_PARAM,
        isNewUser ? "sign_up" : "login"
      );
      const nextWithEvent = `${redirectPath.pathname}${redirectPath.search}`;

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${nextWithEvent}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${nextWithEvent}`);
      } else {
        return NextResponse.redirect(`${origin}${nextWithEvent}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

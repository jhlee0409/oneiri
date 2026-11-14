import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Supabase 세션을 갱신하고, 갱신된 쿠키가 반영된 응답을 반환한다.
 * 리다이렉트는 하지 않는다 (보호 라우트는 클라이언트 AuthGuard가 담당).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // createServerClient와 getUser 사이에 다른 로직을 넣지 말 것:
  // getUser 호출이 만료된 액세스 토큰을 갱신하고 setAll을 통해 쿠키를 기록한다.
  await supabase.auth.getUser();

  // setAll에서 교체된 응답을 반환해야 갱신된 쿠키가 브라우저로 전달된다.
  return supabaseResponse;
}

import { supabase } from "@/utils/supabase/client";

const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.startsWith("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
};

/**
 * Google OAuth를 시작한다. `next`를 주면 콜백(/auth/callback)이 로그인 후 그 경로로 보낸다.
 */
export async function signInWithGoogle(next?: string) {
  const callback = getURL() + "auth/callback";
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: next ? `${callback}?next=${encodeURIComponent(next)}` : callback,
    },
  });
}

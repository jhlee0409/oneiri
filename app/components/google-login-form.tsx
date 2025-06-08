"use client";
import { supabase } from "@/utils/supabase/client";
import { useState } from "react";
import Link from "next/link";

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

export default function GoogleLoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithGoogle() {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getURL() + "auth/callback",
      },
    });
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <button
        onClick={signInWithGoogle}
        className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-900 font-['Inter'] font-medium py-4 px-6 border border-gray-200 transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-900"></div>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 계속하기
          </>
        )}
      </button>

      <div className="text-center text-xs text-gray-500">
        <p>
          계속 진행하면{" "}
          <Link
            href="/terms"
            className="underline hover:text-gray-700 transition-colors"
          >
            서비스 약관
          </Link>{" "}
          및{" "}
          <Link
            href="/privacy"
            className="underline hover:text-gray-700 transition-colors"
          >
            개인정보 처리방침
          </Link>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}

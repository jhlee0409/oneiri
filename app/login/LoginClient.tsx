"use client";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import GoogleLoginForm from "../components/google-login-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { safeNextPath } from "@/lib/login-redirect";
import { savePendingGuestDream } from "@/lib/guest-dream";
import { supabase } from "@/utils/supabase/client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function reasonFor(next: string | null): string {
  if (next?.startsWith("/analysis")) return "꿈 해석은 내 서재에 저장돼서 로그인이 필요해요.";
  if (next?.startsWith("/settings")) return "설정은 로그인한 뒤 바꿀 수 있어요.";
  if (next?.startsWith("/shared") || next?.startsWith("/dreams/")) {
    return "로그인하면 이 꿈에 댓글을 남길 수 있어요.";
  }
  return "로그인하면 꿈 이야기가 서재에 쌓이고, 장면 그림도 함께 그려져요.";
}

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const message = searchParams?.get("message");
  const next = safeNextPath(searchParams?.get("next"));
  const guestDreamId = searchParams?.get("guest");

  useEffect(() => {
    if (error === "withdrawn_user") {
      toast.error(
        message ||
          "탈퇴된 계정입니다. 30일 후 동일한 이메일로 재가입이 가능합니다."
      );
    }
  }, [error, message]);

  // 앱 내장 브라우저에서 넘어온 체험 이야기를 이 브라우저에서 이어서 저장한다.
  useEffect(() => {
    if (guestDreamId && UUID.test(guestDreamId)) savePendingGuestDream(guestDreamId);
  }, [guestDreamId]);

  // 이미 로그인했다면 가려던 곳으로 보낸다.
  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(next ?? "/library/dreams");
    });
  }, [next, router]);

  return (
    <div className="min-h-screen oneiri-bg-primary flex items-center justify-center">
      <div className="max-w-md w-full px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <ImageWithFallback
            src="/oneiri_logo.png"
            alt=""
            width={80}
            height={80}
            className="mx-auto mb-3 sm:mb-4 rounded-full sm:w-[100px] sm:h-[100px]"
            fallbackMessage="로고"
          />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold oneiri-text-primary mb-3 sm:mb-4">
            로그인하고 서재 열기
          </h1>
          <p className="oneiri-text-secondary text-sm sm:text-base break-keep">
            {reasonFor(next)}
          </p>
        </div>
        <GoogleLoginForm next={next ?? "/library/dreams"} />
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import GoogleLoginForm from "../components/google-login-form";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const message = searchParams?.get("message");

  useEffect(() => {
    if (error === "withdrawn_user") {
      toast.error(
        message ||
          "탈퇴된 계정입니다. 30일 후 동일한 이메일로 재가입이 가능합니다."
      );
    }
  }, [error, message]);

  return (
    <div className="min-h-screen oneiri-bg-primary flex items-center justify-center">
      <div className="max-w-md w-full px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <Image
            src="/oneiri_logo.png"
            alt="Oneiri"
            width={80}
            height={80}
            className="mx-auto mb-3 sm:mb-4 rounded-full sm:w-[100px] sm:h-[100px]"
          />
          <h1 className="font-['Inter'] text-3xl sm:text-4xl font-medium oneiri-accent mb-3 sm:mb-4">
            Oneiri
          </h1>
          <p className="oneiri-text-primary text-base sm:text-lg">
            흩어진 꿈의 조각들이, 한 편의 이야기가 됩니다.
          </p>
        </div>
        <GoogleLoginForm />
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm oneiri-text-secondary">
          <p>로그인하고 당신만의 꿈의 서재를 채워가세요.</p>
        </div>
      </div>
    </div>
  );
}

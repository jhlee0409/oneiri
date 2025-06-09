"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isValidUser, setIsValidUser] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const loggedIn = user !== null;
      setIsLoggedIn(loggedIn);

      if (!loggedIn) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      // 탈퇴 회원 체크
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("status")
          .eq("id", user.id)
          .single();

        // 탈퇴된 회원이라면 로그아웃 처리
        if (
          !profileError &&
          profile &&
          (profile.status === "DELETED_PENDING" || profile.status === "DELETED")
        ) {
          await supabase.auth.signOut();
          toast.error("탈퇴된 계정입니다. 다시 로그인해주세요.");
          setIsLoggedIn(false);
          setIsValidUser(false);
          setIsLoading(false);
          router.push("/login?error=withdrawn_user");
          return;
        }

        setIsValidUser(true);
      }

      setIsLoading(false);

      // 로그인 상태에서 로그인 페이지로 갈시 / 로 리다이렉트
      if (loggedIn && pathname === "/login") {
        router.push("/");
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  if (!isLoggedIn || !isValidUser) {
    return null;
  }

  return <>{children}</>;
}

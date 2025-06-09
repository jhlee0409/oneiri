"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import ThemeToggle from "./theme-toggle";

type Props = {
  user: User | null;
};

export default function Header({ user: initialUser }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    // 초기 사용자 상태 설정
    setUser(initialUser);

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <header className="oneiri-bg-secondary border-b border-text-secondary/20 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="font-['Inter'] text-xl font-medium oneiri-accent flex items-center gap-2"
          >
            <Image
              src="/oneiri_logo.png"
              alt="Oneiri"
              width={32}
              height={32}
              className="rounded-full"
            />
            Oneiri
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/library/dreams"
              className="oneiri-text-secondary hover:oneiri-accent transition-colors"
            >
              내 서재
            </Link>
            <Link
              href="/dreams"
              className="oneiri-text-secondary hover:oneiri-accent transition-colors"
            >
              탐험하기
            </Link>

            <ThemeToggle />

            <div className="flex items-center gap-3">
              <Image
                src={user.user_metadata.avatar_url}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
              <button
                onClick={handleLogout}
                className="text-sm oneiri-text-secondary hover:oneiri-text-primary transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

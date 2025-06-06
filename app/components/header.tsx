"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";

type Props = {
  user: User | null;
};

export default function Header({ user }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="font-['Inter'] text-xl font-medium text-gray-900"
          >
            꿈 일기
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/journal"
              className="text-gray-600 hover:text-black transition-colors"
            >
              내 일기
            </Link>
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
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
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

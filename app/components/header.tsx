"use client";

import type { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Menu, PenLine } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { loginPath } from "@/lib/login-redirect";

type Props = {
  user: User | null;
};

// 꿈 해석은 각 꿈 상세의 「이 꿈의 상징 읽기」로 들어간다.
const NAV_LINKS = [
  { href: "/library/dreams", label: "서재", requiresUser: true },
  { href: "/dreams", label: "둘러보기", requiresUser: false },
];

function isActive(pathname: string, href: string) {
  if (href === "/dreams") return pathname === "/dreams" || pathname.startsWith("/shared");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({ user: initialUser }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(initialUser);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    const loadName = async (userId: string) => {
      const { data } = await supabase
        .from("user_profiles")
        .select("display_name")
        .eq("id", userId)
        .maybeSingle();
      setDisplayName(data?.display_name ?? null);
    };
    if (initialUser) void loadName(initialUser.id);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setDisplayName(null);
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        void loadName(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [initialUser]);

  // 화면을 옮기면 모바일 메뉴를 닫는다.
  useEffect(() => setIsMenuOpen(false), [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.push("/");
  };

  const links = NAV_LINKS.filter((link) => !link.requiresUser || user);
  const recordButton = (
    <Link
      href="/dreams/new"
      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-accent-primary px-4 text-sm font-medium text-bg-primary transition-[filter] duration-200 hover:brightness-110"
    >
      <PenLine className="h-4 w-4" aria-hidden="true" />꿈 기록하기
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg-primary/90 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Oneiri 홈">
          <Image src="/oneiri_logo.png" alt="" width={32} height={32} className="rounded-full" />
          <span className="font-italianno text-2xl font-bold text-text-primary">Oneiri</span>
        </Link>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-accent-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {pathname !== "/dreams/new" && recordButton}
          {user ? (
            <Link href="/settings" aria-label="설정" className="rounded-full">
              <UserAvatar user={user} size="md" className="transition-opacity hover:opacity-80" />
            </Link>
          ) : (
            <Link
              href={loginPath(pathname)}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              로그인
            </Link>
          )}
        </div>

        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger
            aria-label="메뉴 열기"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary md:hidden"
          >
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="right" className="flex w-80 max-w-[85vw] flex-col border-line bg-bg-secondary p-0">
            <SheetTitle className="sr-only">메뉴</SheetTitle>
            {user && (
              <div className="flex items-center gap-3 border-b border-line px-5 pb-5 pt-12">
                <UserAvatar user={user} size="md" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-text-primary">
                    {displayName || user.user_metadata?.full_name || "꿈꾸는자"}
                  </p>
                  <p className="truncate text-sm text-text-secondary">{user.email}</p>
                </div>
              </div>
            )}
            <nav aria-label="모바일 메뉴" className={cn("flex-1 px-3 py-4", !user && "pt-12")}>
              <Link
                href="/dreams/new"
                className="mb-3 flex min-h-12 items-center gap-2 rounded-lg bg-accent-primary px-4 font-medium text-bg-primary"
              >
                <PenLine className="h-4 w-4" aria-hidden="true" />꿈 기록하기
              </Link>
              {[...links, ...(user ? [{ href: "/settings", label: "설정" }] : [])].map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center rounded-lg px-4 text-base",
                      active
                        ? "bg-bg-primary text-text-primary"
                        : "text-text-secondary hover:bg-bg-primary/60 hover:text-text-primary"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-line p-4">
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex min-h-12 w-full items-center gap-3 rounded-lg px-4 text-text-secondary hover:text-text-primary"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  로그아웃
                </button>
              ) : (
                <Link
                  href={loginPath(pathname)}
                  className="flex min-h-12 w-full items-center justify-center rounded-lg border border-line font-medium text-text-primary"
                >
                  로그인
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

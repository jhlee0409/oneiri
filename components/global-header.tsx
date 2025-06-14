"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ImageWithFallback } from "./ui/image-with-fallback";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/app/components/theme-toggle";
import { UserAvatar } from "./ui/user-avatar";
import {
  Menu,
  Settings,
  X,
  LogOut,
  MoonStar,
  BookOpen,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
type Props = {
  user: User | null;
};

export function GlobalHeader({ user: initialUser }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  // 사용자 프로필 데이터 가져오기
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    // 초기 사용자 상태 설정
    setUser(initialUser);

    // 초기 사용자가 있으면 프로필 데이터 가져오기
    if (initialUser) {
      fetchUserProfile(initialUser.id);
    }

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setUserProfile(null);
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  // 모바일 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // 모바일 메뉴가 열렸을 때 스크롤 방지
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    closeMobileMenu();
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navigationLinks = [
    {
      href: "/analysis/new",
      label: "꿈 분석하기",
      icon: MoonStar,
    },
    {
      href: "/library/dreams",
      label: "내 서재",
      icon: BookOpen,
    },
    {
      href: "/dreams",
      label: "탐험하기",
      icon: Compass,
    },
  ];
  // 표시할 사용자 이름 결정
  const displayName = useMemo(() => {
    return (
      userProfile?.display_name || user?.user_metadata?.display_name || "사용자"
    );
  }, [userProfile, user]);

  const isHomePage = useMemo(() => {
    return pathname === "/";
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "transition-all duration-300",
          isScrolled
            ? "backdrop-blur-custom oneiri-bg-secondary"
            : "bg-transparent",
          isHomePage && "fixed top-0 left-0 right-0 z-50",
          !isHomePage && "oneiri-bg-secondary sticky top-0 left-0 right-0 z-50"
        )}
      >
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <ImageWithFallback
              src="/oneiri_logo.png"
              alt="Oneiri"
              width={32}
              height={32}
              className="rounded-full"
              fallbackMessage="로고"
            />
            <span className="font-serif font-bold text-2xl text-slate-100">
              Oneiri
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-label text-slate-300 hover:text-slate-100 transition-colors text-normal font-bold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex  items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <Link href="/settings" className="group">
                <UserAvatar
                  user={user}
                  size="md"
                  className="group-hover:opacity-80 transition-opacity"
                />
              </Link>
            ) : (
              <Button
                variant="ghost"
                className="text-label text-slate-300 hover:text-slate-100 hover:bg-navy-700 px-4 py-2 h-auto"
              >
                로그인
              </Button>
            )}
          </div>
          {/* 모바일 네비게이션 */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="p-2 oneiri-text-secondary hover:oneiri-accent transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          {/* 오프캔버스 메뉴 */}
          <div
            ref={mobileMenuRef}
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] oneiri-bg-secondary border-l border-text-secondary/20 transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* 메뉴 헤더 */}
            <div className="flex justify-between items-center p-6 border-b border-text-secondary/20">
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src="/oneiri_logo.png"
                  alt="Oneiri"
                  width={32}
                  height={32}
                  className="rounded-full"
                  fallbackMessage="로고"
                />
                <h2 className="text-lg font-semibold oneiri-text-primary">
                  메뉴
                </h2>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 oneiri-text-secondary hover:oneiri-accent transition-colors rounded-lg"
                aria-label="메뉴 닫기"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 메뉴 내용 */}
            <div className="flex-1 overflow-y-auto pb-32">
              {/* 기본 네비게이션 */}
              <nav className="p-6">
                <ul className="space-y-2">
                  {navigationLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={closeMobileMenu}
                          className="flex items-center gap-4 py-4 px-4 oneiri-text-secondary hover:oneiri-accent hover:bg-text-secondary/5 rounded-lg transition-all duration-200"
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="text-lg">{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* 구분선 */}
              <div className="mx-6 border-t border-text-secondary/10"></div>

              {/* 설정 메뉴 */}
              <nav className="p-6 pt-4">
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/settings"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-4 py-4 px-4 oneiri-text-secondary hover:oneiri-accent hover:bg-text-secondary/5 rounded-lg transition-all duration-200"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="text-lg">설정</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* 메뉴 최하단 - 사용자 정보 */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-text-secondary/10 bg-oneiri-bg-secondary p-4">
              <div className="flex items-center gap-3 mb-4 px-4">
                <UserAvatar user={user} size="md" />

                <div className="flex-1 min-w-0">
                  <p className="oneiri-text-primary font-medium truncate text-lg">
                    {displayName}
                  </p>
                  <p className="oneiri-text-secondary text-sm truncate">
                    {user?.email}
                  </p>
                </div>
                <ThemeToggle position="right top" />
              </div>

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full py-3 px-4 oneiri-text-secondary hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-lg">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

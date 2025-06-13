"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ImageWithFallback } from "./ui/image-with-fallback";

export function GlobalHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-custom bg-navy-800/80" : "bg-transparent"
      }`}
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
          <a
            href="#analyze"
            className="text-label text-slate-300 hover:text-slate-100 transition-colors"
          >
            꿈 분석하기
          </a>
          <a
            href="#explore"
            className="text-label text-slate-300 hover:text-slate-100 transition-colors"
          >
            탐험하기
          </a>
          <a
            href="#library"
            className="text-label text-slate-300 hover:text-slate-100 transition-colors"
          >
            나의 꿈 서재
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            className="text-label text-slate-300 hover:text-slate-100 hover:bg-navy-700 px-4 py-2 h-auto"
          >
            로그인
          </Button>
        </div>
      </div>
    </header>
  );
}

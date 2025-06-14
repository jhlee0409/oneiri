import Link from "next/link";
import { Github, Twitter, Mail, Heart } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="oneiri-bg-secondary border-t border-text-secondary mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* 브랜드 정보 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                <ImageWithFallback
                  src="/oneiri_logo.png"
                  alt="Oneiri"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover rounded-full"
                  fallbackMessage="로고"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gold-500">
                Oneiri
              </h3>
            </div>
            <p className="text-slate-300 mb-3 sm:mb-4 max-w-md text-sm sm:text-base">
              간밤의 꿈, 한 편의 이야기가 되다. <br />
              당신의 흩어진 꿈 조각으로, AI와 함께 세상에 없던 이야기를
              만들어보세요.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <Link
                href="https://github.com/jhlee0409"
                className="oneiri-text-secondary hover:oneiri-accent transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                href="mailto:relee6203@gmail.com"
                className="oneiri-text-secondary hover:oneiri-accent transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 sm:mb-4">
              서비스
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-slate-300 hover:text-gold-500 transition-colors text-sm sm:text-base"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/library/dreams"
                  className="text-slate-300 hover:text-gold-500 transition-colors text-sm sm:text-base"
                >
                  꿈 일기
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-text-secondary/20 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-1 text-xs sm:text-sm oneiri-text-secondary mb-3 md:mb-0">
              <span>
                © {currentYear} Oneiri. All Rights Reserved. Made with
              </span>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-oneiri-garnet fill-current" />
              <span>in Seoul, Korea</span>
            </div>
            <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm oneiri-text-secondary">
              <Link
                href="/privacy"
                className="hover:text-gold-500 transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="hover:text-gold-500 transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/notices"
                className="hover:text-gold-500 transition-colors"
              >
                공지사항
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

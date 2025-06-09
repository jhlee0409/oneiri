import Link from "next/link";
import { Github, Twitter, Mail, Heart } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="oneiri-bg-secondary border-t border-text-secondary/20 mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 정보 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <Image
                  src="/oneiri_logo.png"
                  alt="Oneiri"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-xl font-bold oneiri-accent">Oneiri</h3>
            </div>
            <p className="oneiri-text-secondary mb-4 max-w-md">
              간밤의 꿈, 한 편의 이야기가 되다. <br />
              당신의 흩어진 꿈 조각으로, AI와 함께 세상에 없던 이야기를
              만들어보세요.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/jhlee0409"
                className="oneiri-text-secondary hover:oneiri-accent transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="mailto:relee6203@gmail.com"
                className="oneiri-text-secondary hover:oneiri-accent transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h4 className="text-sm font-semibold oneiri-text-primary uppercase tracking-wider mb-4">
              서비스
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="oneiri-text-secondary hover:oneiri-text-primary transition-colors"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/library/dreams"
                  className="oneiri-text-secondary hover:oneiri-text-primary transition-colors"
                >
                  꿈 일기
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 및 정보 */}
          <div>
            <h4 className="text-sm font-semibold oneiri-text-primary uppercase tracking-wider mb-4">
              지원
            </h4>
            <ul className="space-y-3">
              {/* <li>
                <Link
                  href="/help"
                  className="oneiri-text-secondary hover:oneiri-text-primary transition-colors"
                >
                  도움말
                </Link>
              </li> */}
              {/* <li>
                <Link
                  href="/about"
                  className="oneiri-text-secondary hover:oneiri-text-primary transition-colors"
                >
                  소개
                </Link>
              </li> */}
              <li>
                <Link
                  href="/privacy"
                  className="oneiri-text-secondary hover:oneiri-text-primary transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="oneiri-text-secondary hover:oneiri-text-primary transition-colors"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-text-secondary/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-1 text-sm oneiri-text-secondary mb-4 md:mb-0">
              <span>
                © {currentYear} Oneiri. All Rights Reserved. Made with
              </span>
              <Heart className="w-4 h-4 text-oneiri-garnet fill-current" />
              <span>in Seoul, Korea</span>
            </div>
            <div className="flex space-x-6 text-sm oneiri-text-secondary">
              <Link
                href="/privacy"
                className="hover:oneiri-text-primary transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="hover:oneiri-text-primary transition-colors"
              >
                이용약관
              </Link>
              {/* <li>
                <Link
                  href="/contact"
                  className="hover:oneiri-text-primary transition-colors"
                >
                  문의하기
                </Link>
              </li> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

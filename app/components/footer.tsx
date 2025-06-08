import Link from "next/link";
import { Github, Twitter, Mail, Heart } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
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
              <h3 className="text-xl font-bold text-gray-900">Oneiri</h3>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              간밤의 꿈, 한 편의 이야기가 되다. <br />
              당신의 흩어진 꿈 조각으로, AI와 함께 세상에 없던 이야기를
              만들어보세요.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/jhlee0409"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="mailto:relee6203@gmail.com"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              서비스
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/journal"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  꿈 일기
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 및 정보 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              지원
            </h4>
            <ul className="space-y-3">
              {/* <li>
                <Link
                  href="/help"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  도움말
                </Link>
              </li> */}
              {/* <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  소개
                </Link>
              </li> */}
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-1 text-sm text-gray-500 mb-4 md:mb-0">
              <span>© {currentYear} Oneiri. Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>in Seoul, Korea</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-500">
              <Link
                href="/privacy"
                className="hover:text-gray-700 transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="hover:text-gray-700 transition-colors"
              >
                이용약관
              </Link>
              {/* <Link
                href="/contact"
                className="hover:text-gray-700 transition-colors"
              >
                문의하기
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

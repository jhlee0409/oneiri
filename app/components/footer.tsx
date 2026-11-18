import Link from "next/link";
import { APP_CONFIG } from "@/lib/constants";

const LINK = "inline-flex min-h-11 items-center hover:text-text-primary transition-colors";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-bg-primary">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-text-secondary sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="font-italianno text-2xl font-bold text-text-primary">Oneiri</p>
          <p className="break-keep">간밤의 꿈을 한 편의 이야기로 남기는 서재</p>
        </div>
        <nav aria-label="바닥글" className="flex flex-col gap-x-6 md:items-end">
          <div className="flex flex-wrap gap-x-6">
            <Link href="/library/dreams" className={LINK}>서재</Link>
            <Link href="/dreams" className={LINK}>둘러보기</Link>
            <Link href="/notices" className={LINK}>공지사항</Link>
            <a href={APP_CONFIG.DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
              문의하기
            </a>
          </div>
          <div className="flex flex-wrap gap-x-6">
            <Link href="/privacy" className={LINK}>개인정보처리방침</Link>
            <Link href="/terms" className={LINK}>이용약관</Link>
            <span className="inline-flex min-h-11 items-center">© {currentYear} Oneiri</span>
          </div>
        </nav>
      </div>
    </footer>
  );
}

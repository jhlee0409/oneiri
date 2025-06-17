import Link from "next/link";
import { DiscordIcon } from "@/components/icons/discord";
import { APP_CONFIG } from "@/lib/constants";

export function LandingFooter() {
  return (
    <footer className="h-60 flex flex-col items-center justify-center bg-navy-900">
      <div className="text-center">
        {/* Links */}
        <div className="flex items-center space-x-6 mb-8">
          <Link href="/terms" className="text-caption text-slate-300 hover:text-gold-500 transition-colors">
            서비스 약관
          </Link>
          <Link href="/privacy" className="text-caption text-slate-300 hover:text-gold-500 transition-colors">
            개인정보처리방침
          </Link>
          <Link 
            href={APP_CONFIG.DISCORD_INVITE_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-caption text-slate-300 hover:text-gold-500 transition-colors flex items-center gap-1"
          >
            <DiscordIcon className="w-4 h-4" />
            고객지원
          </Link>
        </div>

        {/* Divider */}
        <div className="w-[120px] h-px bg-navy-700 mx-auto mb-8" />

        {/* Copyright */}
        <p className="text-caption text-slate-500">© 2025 Oneiri. All Rights Reserved.</p>
      </div>
    </footer>
  )
}

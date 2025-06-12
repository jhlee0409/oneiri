import { Button } from "@/components/ui/button"
import { Menu, Search, User } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-navy-700 bg-navy-800/50 backdrop-blur-sm">
      <div className="mx-auto max-w-container px-lg">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-oneiri bg-gold-500 flex items-center justify-center">
                <span className="text-navy-900 font-serif font-bold text-sm">O</span>
              </div>
              <span className="font-serif font-bold text-headline text-slate-100">Oneiri</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-body text-slate-300 hover:text-gold-500 transition-colors">
              탐험하기
            </a>
            <a href="#" className="text-body text-slate-300 hover:text-gold-500 transition-colors">
              이야기
            </a>
            <a href="#" className="text-body text-slate-300 hover:text-gold-500 transition-colors">
              커뮤니티
            </a>
            <a href="#" className="text-body text-slate-300 hover:text-gold-500 transition-colors">
              도움말
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-300 hover:text-gold-500 transition-colors">
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button className="p-2 text-slate-300 hover:text-gold-500 transition-colors">
              <User className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <Button variant="default" size="sm">
              시작하기
            </Button>
            <button className="md:hidden p-2 text-slate-300 hover:text-gold-500 transition-colors">
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

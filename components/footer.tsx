export function Footer() {
  return (
    <footer className="h-60 flex flex-col items-center justify-center bg-navy-900">
      <div className="text-center">
        {/* Links */}
        <div className="flex items-center space-x-6 mb-8">
          <a href="#" className="text-caption text-slate-300 hover:text-gold-500 transition-colors">
            서비스 약관
          </a>
          <a href="#" className="text-caption text-slate-300 hover:text-gold-500 transition-colors">
            개인정보처리방침
          </a>
          <a href="#" className="text-caption text-slate-300 hover:text-gold-500 transition-colors">
            공지사항
          </a>
        </div>

        {/* Divider */}
        <div className="w-[120px] h-px bg-navy-700 mx-auto mb-8" />

        {/* Copyright */}
        <p className="text-caption text-slate-500">© 2025 Oneiri. All Rights Reserved. Made with ♥ in Seoul, Korea</p>
      </div>
    </footer>
  )
}

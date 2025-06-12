import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 bg-navy-800/50">
      <div className="mx-auto max-w-container px-lg">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-serif font-bold text-headline text-slate-100 mb-4">당신의 창작 여정을 시작하세요</h2>
          <p className="text-body-large text-slate-300 mb-8">
            지금 가입하고 무료로 Oneiri의 모든 기능을 체험해보세요. 첫 번째 작품을 만드는 순간, 새로운 세계가 열립니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
            <Input type="email" placeholder="이메일 주소를 입력하세요" className="flex-1" />
            <Button className="group">
              시작하기
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
            </Button>
          </div>

          <p className="text-caption text-slate-500">
            가입 시{" "}
            <a href="#" className="text-gold-500 hover:text-gold-300 transition-colors">
              이용약관
            </a>{" "}
            및{" "}
            <a href="#" className="text-gold-500 hover:text-gold-300 transition-colors">
              개인정보처리방침
            </a>
            에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </section>
  )
}

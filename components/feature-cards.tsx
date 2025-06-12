import { Card } from "@/components/ui/card"
import { Sparkles, Palette, Users, Zap } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "무한한 창의성",
    description: "AI와 함께 상상력의 경계를 넘어서는 독창적인 콘텐츠를 만들어보세요.",
  },
  {
    icon: Palette,
    title: "개인화된 경험",
    description: "당신의 취향과 스타일에 맞춰 완벽하게 맞춤화된 창작 환경을 제공합니다.",
  },
  {
    icon: Users,
    title: "협업의 힘",
    description: "전 세계 크리에이터들과 함께 아이디어를 공유하고 발전시켜나가세요.",
  },
  {
    icon: Zap,
    title: "즉시 실현",
    description: "생각한 순간 바로 구현되는 빠른 프로토타이핑으로 아이디어를 현실화하세요.",
  },
]

export function FeatureCards() {
  return (
    <section className="py-24 bg-navy-800/30">
      <div className="mx-auto max-w-container px-lg">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-headline text-slate-100 mb-4">왜 Oneiri를 선택해야 할까요?</h2>
          <p className="text-body text-slate-300 max-w-2xl mx-auto">
            혁신적인 기술과 직관적인 디자인이 만나 창작의 새로운 패러다임을 제시합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-oneiri transition-all duration-300">
              <div className="p-6">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-oneiri bg-navy-700 group-hover:bg-gold-500/10 transition-colors">
                    <feature.icon className="h-6 w-6 text-gold-500" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-sans font-semibold text-title text-slate-100 mb-3">{feature.title}</h3>
                <p className="text-body text-slate-300">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

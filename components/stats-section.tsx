export function StatsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-container px-lg">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-headline text-slate-100 mb-4">숫자로 보는 Oneiri</h2>
          <p className="text-body text-slate-300">전 세계 크리에이터들이 신뢰하는 플랫폼</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-oneiri bg-navy-800 border border-navy-700">
            <div className="font-serif font-bold text-display text-gold-500 mb-2">2.5M</div>
            <div className="text-body text-slate-300 mb-1">총 사용자</div>
            <div className="text-caption text-slate-500">지난 달 대비 +23%</div>
          </div>
          <div className="text-center p-6 rounded-oneiri bg-navy-800 border border-navy-700">
            <div className="font-serif font-bold text-display text-gold-500 mb-2">15M</div>
            <div className="text-body text-slate-300 mb-1">생성된 작품</div>
            <div className="text-caption text-slate-500">매일 50K+ 신규 작품</div>
          </div>
          <div className="text-center p-6 rounded-oneiri bg-navy-800 border border-navy-700">
            <div className="font-serif font-bold text-display text-gold-500 mb-2">98.5%</div>
            <div className="text-body text-slate-300 mb-1">사용자 만족도</div>
            <div className="text-caption text-slate-500">5점 만점 기준 4.9점</div>
          </div>
          <div className="text-center p-6 rounded-oneiri bg-navy-800 border border-navy-700">
            <div className="font-serif font-bold text-display text-gold-500 mb-2">24/7</div>
            <div className="text-body text-slate-300 mb-1">고객 지원</div>
            <div className="text-caption text-slate-500">평균 응답시간 2분</div>
          </div>
        </div>
      </div>
    </section>
  )
}

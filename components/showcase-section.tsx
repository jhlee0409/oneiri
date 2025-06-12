export function ShowcaseSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-[120px] bg-navy-900">
      <div className="grid-oneiri items-center gap-8 sm:gap-10 md:gap-12 lg:gap-12" style={{ gap: "32px" }}>
        {/* Text Area - Columns 1-5 */}
        <div className="col-span-12 lg:col-span-5 px-4 sm:px-6 lg:px-0 text-center lg:text-left">
          <h2 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl lg:text-headline text-slate-100 mb-4 sm:mb-6">
            단순한 분석을 넘어, 당신의 상징을 마주하세요.
          </h2>
          <p className="text-sm sm:text-base md:text-body text-slate-300 max-w-lg mx-auto lg:mx-0">
            Oneiri는 당신의 꿈을 12가지 심리 원형을 담은 '꿈의 원형 카드'로
            시각화합니다. 당신의 무의식은 오늘, 어떤 카드를 보여줄까요?
          </p>
        </div>

        {/* Image Area - Columns 6-12 */}
        <div className="col-span-12 lg:col-span-7 px-4 sm:px-6 lg:px-0">
          <div
            className="aspect-video rounded-oneiri shadow-showcase transition-transform duration-300 hover:scale-[1.02] lg:hover:scale-[1.03] cursor-pointer"
            style={{
              backgroundImage: `url('/images/showcase-section.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      </div>
    </section>
  );
}

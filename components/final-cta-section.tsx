import { Button } from "@/components/ui/button";

export function FinalCTASection() {
  return (
    <section
      className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:h-[800px] flex items-center justify-center bg-navy-900 py-16 sm:py-20 md:py-24"
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(10, 25, 47, 0) 0%, rgba(10, 25, 47, 1) 100%), url('/images/final-cta-section.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      <div className="text-center px-4 sm:px-6">
        <h2 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl lg:text-headline text-slate-100 mb-4 sm:mb-6">
          당신의 이야기도 하나의 별이 됩니다
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-body-large text-slate-100 mb-8 sm:mb-10 md:mb-12 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
          Oneiri의 우주에서 다른 탐험가들과 영감을 나누고, 끝없는 내면을
          탐험하는 여정을 지금 시작하세요.
        </p>
        <Button className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-6 lg:py-8 text-sm sm:text-base md:text-lg lg:text-xl bg-gold-500 text-navy-900 hover:bg-gold-300 hover:-translate-y-1 transition-all duration-300">
          지금, 당신의 우주로 입장하기
        </Button>
      </div>
    </section>
  );
}

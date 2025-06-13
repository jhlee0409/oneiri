import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen h-screen flex items-end bg-navy-900">
      <video
        src="/videos/hero-section.mp4"
        autoPlay
        loop
        muted
        controls={false}
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="grid-oneiri w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="col-span-12 text-center pb-16 sm:pb-20 md:pb-[100px] lg:pb-[120px]">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-display text-slate-100 mb-6 sm:mb-8 leading-tight">
            어젯밤 꾼 꿈, 어떤 그림이 될까?
          </h1>
          <p className="text-lg sm:text-xl md:text-body-large text-slate-100 mb-12 sm:mb-16 md:mb-20 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4 font-normal">
            AI가 당신의 꿈 조각으로, 세상에 단 하나뿐인 마법 카드를
            만들어드려요.
          </p>
          <Button
            variant="outline"
            className="text-sm sm:text-base md:text-label border-gold-500 text-slate-100 bg-gold-500 hover:bg-gold-600 hover:text-navy-900 px-6 sm:px-8 py-3 sm:py-4 h-auto transition-all duration-800 animate-float"
          >
            내 첫 카드 바로 받기!
          </Button>
        </div>
      </div>
    </section>
  );
}

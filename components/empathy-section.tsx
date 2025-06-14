export function EmpathySection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-navy-900 py-16 sm:py-20 md:py-24"
      style={{
        backgroundImage: `url('/images/empathy-section.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-[840px] mx-4 sm:mx-6 p-6 sm:p-8 md:p-12 lg:p-16 bg-navy-800/20 backdrop-blur-oneiri-soft rounded-oneiri text-center">
        <h2 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl lg:text-headline text-slate-100 mb-3 sm:mb-4">
          Oneiri에서 당신의 꿈은 더 이상 스쳐 지나가지 않아요.
        </h2>
        <p className="text-sm sm:text-base md:text-body text-slate-100 leading-[170%]">
          {`
          어젯밤의 생생했던 이야기들도,
아침이 오면 안개처럼 희미해집니다.

그 안에는 당신만이 알아볼 수 있는
조용한 신호와 상징이 숨어 있을지도 모릅니다.

이제 그 꿈의 잔상을, 이야기로 꺼내볼 시간입니다.
          `}
        </p>
      </div>
    </section>
  );
}

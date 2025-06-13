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
      <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-[800px] mx-4 sm:mx-6 p-6 sm:p-8 md:p-12 lg:p-16 bg-navy-800/20 backdrop-blur-oneiri-soft rounded-oneiri text-center">
        <h2 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl lg:text-headline text-slate-100 mb-3 sm:mb-4">
          눈을 뜨면 사라지는 꿈의 조각들
        </h2>
        <p className="text-sm sm:text-base md:text-body text-slate-100 leading-[170%]">
          어젯밤의 생생했던 이야기도, 아침이면 안개처럼 희미해집니다. 그 안에는
          당신만이 발견할 수 있는 소중한 의미가 숨어있을지 모릅니다.
        </p>
      </div>
    </section>
  );
}

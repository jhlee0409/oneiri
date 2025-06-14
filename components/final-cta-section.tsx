import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

export function FinalCTASection() {
  return (
    <section
      className="relative h-screen flex items-center justify-center bg-navy-900"
      style={{
        backgroundImage: `radial-gradient(ellipse at center, rgba(10, 25, 47, 0) 0%, rgba(10, 25, 47, 1) 100%), url('/images/final-cta-section.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      <div className="text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <h2 className="font-serif font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-headline text-slate-100 mb-3 sm:mb-4 lg:mb-6">
          잊히기 전에, 그 꿈을 한번 들여다볼까요?
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-body-large text-slate-100 mb-6 sm:mb-8 lg:mb-12 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
          짧은 꿈이라도 괜찮아요. AI가 상징과 감정을 정리해 드릴게요.
        </p>
        <Link href="/analysis/new">
          <Button className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-6 lg:py-8 text-sm sm:text-base md:text-lg lg:text-xl bg-gold-500 text-navy-900 hover:bg-gold-300 hover:-translate-y-1 transition-all duration-300">
            <Pencil className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            지금 내 꿈 분석하기
          </Button>
        </Link>
      </div>
    </section>
  );
}

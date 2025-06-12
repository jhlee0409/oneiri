import { Feather, Compass, Book } from "lucide-react";
import { ImageWithFallback } from "./ui/image-with-fallback";

export function SolutionSection() {
  return (
    <section className="min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:h-[720px] flex items-center justify-center bg-navy-900 py-8 sm:py-12 md:py-16 lg:py-0">
      <div className="grid-oneiri">
        {/* 아이템 1 - 컬럼 1-4 */}
        <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-4 text-center bg-navy-800 rounded-lg p-8 shadow-oneiri">
          <div className="inline-flex items-center justify-center mb-6 w-1/2 mx-auto sm:w-full sm:mx-0 sm:mb-0 md:w-1/2 md:mx-auto lg:w-full lg:mx-0 lg:mb-0">
            <ImageWithFallback
              src="/images/quill-pen.png"
              alt="기록하세요"
              width={256}
              height={256}
            />
          </div>
          <h3 className="font-sans font-semibold text-title text-slate-100 mb-2">
            기록하세요
          </h3>
          <p className="text-body text-slate-300 w-4/5 mx-auto">
            떠오르는 기억의 조각들을 자유롭게 기록하면, Oneiri가 그 속에서
            패턴을 찾아냅니다.
          </p>
        </div>

        {/* 아이템 2 - 컬럼 5-8 */}
        <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-4 text-center bg-navy-800 rounded-lg p-8 shadow-oneiri">
          <div className="inline-flex items-center justify-center mb-6 w-1/2 mx-auto sm:w-full sm:mx-0 sm:mb-0 md:w-1/2 md:mx-auto lg:w-full lg:mx-0 lg:mb-0">
            <ImageWithFallback
              src="/images/compass.png"
              alt="발견하세요"
              width={256}
              height={256}
            />
          </div>
          <h3 className="font-sans font-semibold text-title text-slate-100 mb-2">
            발견하세요
          </h3>
          <p className="text-body text-slate-300 w-4/5 mx-auto">
            AI가 당신의 꿈을 심리적 원형과 상징으로 분석하여, 내면의 목소리를
            들려줍니다.
          </p>
        </div>

        {/* 아이템 3 - 컬럼 9-12 */}
        <div className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-4 text-center bg-navy-800 rounded-lg p-8 shadow-oneiri">
          <div className="inline-flex items-center justify-center mb-6 w-1/2 mx-auto sm:w-full sm:mx-0 sm:mb-0 md:w-1/2 md:mx-auto lg:w-full lg:mx-0 lg:mb-0">
            <ImageWithFallback
              src="/images/book.png"
              alt="발견하세요"
              width={256}
              height={256}
            />
          </div>
          <h3 className="font-sans font-semibold text-title text-slate-100 mb-2">
            간직하세요
          </h3>
          <p className="text-body text-slate-300 w-4/5 mx-auto">
            모든 탐험의 기록은 '나의 꿈 서재'에 쌓여, 당신만의 고유한 무의식
            지도가 됩니다.
          </p>
        </div>
      </div>
    </section>
  );
}

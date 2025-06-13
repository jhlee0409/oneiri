import { Feather, Compass, Book } from "lucide-react";
import { ImageWithFallback } from "./ui/image-with-fallback";

const solutionItems = [
  {
    title: "당신의 꿈 조각을 들려주세요",
    description:
      "아주 사소한 기억이라도 괜찮아요. 흩어진 조각들을 건네주는 것에서부터, 당신의 진짜 여정이 시작됩니다.",
    img: "/images/quill-pen.png",
    alt: "기록하세요",
  },
  {
    title: "숨겨진 의미를 탐험하세요",
    description:
      "Oneiri가 당신의 이야기 속에서 길을 찾아내고, 그 끝에서 기다리는 아름다운 '원형 카드'를 발견해 드립니다.",
    img: "/images/compass.png",
    alt: "발견하세요",
  },
  {
    title: "당신만의 서재를 완성하세요",
    description:
      "발견한 카드들이 당신의 서재를 채워갈수록, 이전에는 보이지 않던 당신만의 '꿈의 패턴'이 모습을 드러낼 거예요.",
    img: "/images/book.png",
    alt: "서재를 완성하세요",
  },
];

export function SolutionSection() {
  return (
    <section className="min-h-[400px] sm:min-h-[500px] md:min-h-[700px] lg:h-[1000px] flex items-center justify-center bg-navy-900 py-8 sm:py-12 md:py-16 lg:py-0">
      <div className="grid-oneiri">
        {solutionItems.map((item) => (
          <div
            key={item.title}
            className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-4 text-center bg-navy-800 rounded-lg p-8 shadow-oneiri"
          >
            <div className="inline-flex items-center justify-center mb-6 w-1/2 mx-auto sm:w-full sm:mx-0 sm:mb-0 md:w-1/2 md:mx-auto lg:w-full lg:mx-0 lg:mb-0">
              <ImageWithFallback
                src={item.img}
                alt={item.alt}
                width={256}
                height={256}
              />
            </div>
            <h3 className="font-sans font-semibold text-title text-slate-100 mb-2">
              {item.title}
            </h3>
            <p className="text-body text-slate-300 w-4/5 mx-auto whitespace-break-spaces break-keep">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

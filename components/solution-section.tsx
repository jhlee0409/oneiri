import Image from "next/image";

const steps = [
  {
    title: "장면 한 줄을 적어요",
    description: "눈뜨자마자 떠오른 장면, 목소리, 남은 감정. 흐릿한 조각 하나여도 괜찮아요.",
    img: "/images/quill-pen.png",
  },
  {
    title: "이야기와 그림을 받아요",
    description: "그 장면을 중심으로 짧은 1인칭 이야기를 엮고, 가장 선명한 순간을 그림으로 그려요.",
    img: "/images/compass.png",
  },
  {
    title: "서재에 쌓으면 패턴이 보여요",
    description: "꿈이 세 편 넘게 모이면 자주 돌아오는 상징과 감정의 흐름을 정리해 드려요.",
    img: "/images/book.png",
  },
];

export function SolutionSection() {
  return (
    <section className="oneiri-bg-primary border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <h2 className="font-serif text-2xl font-bold oneiri-text-primary sm:text-3xl">
          아침 1분, 이렇게 남아요
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-5 md:flex-col md:gap-4">
              <Image
                src={step.img}
                alt=""
                width={72}
                height={72}
                className="h-16 w-16 shrink-0 object-contain opacity-90 md:h-20 md:w-20"
              />
              <div>
                <p className="text-sm tabular-nums oneiri-accent">0{index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold oneiri-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed oneiri-text-secondary break-keep">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

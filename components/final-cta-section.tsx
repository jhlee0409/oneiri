import Link from "next/link";

export function FinalCTASection() {
  return (
    <section className="oneiri-bg-primary border-t border-text-secondary/15">
      <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8 md:py-28">
        <h2 className="font-serif text-2xl font-bold oneiri-text-primary break-keep sm:text-3xl">
          잊히기 전에, 오늘 아침의 꿈을 적어 볼까요?
        </h2>
        <p className="mt-4 text-base oneiri-text-secondary break-keep">
          짧은 꿈이라도 괜찮아요. 로그인 없이 한 편 만들어 볼 수 있어요.
        </p>
        <Link
          href="/dreams/new"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg oneiri-accent-bg px-7 font-medium text-bg-primary transition-[filter,transform] duration-200 hover:brightness-110 active:translate-y-px"
        >
          로그인 없이 꿈 적어보기
        </Link>
      </div>
    </section>
  );
}

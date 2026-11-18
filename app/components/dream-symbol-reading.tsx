"use client";

import { useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  useCreateDreamSymbolReading,
  useDreamSymbolReading,
} from "@/hooks/use-dream-api";

const actionClass =
  "inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-60";

/** 꿈 페이지 아래, 이 꿈 하나의 상징 리포트로 이어지는 조용한 섹션. 꿈 주인에게만 마운트한다. */
export default function DreamSymbolReading({ dreamId }: { dreamId: string }) {
  const headingId = useId();
  const router = useRouter();
  const reading = useDreamSymbolReading(dreamId);
  const create = useCreateDreamSymbolReading();
  const reportId = reading.data;

  const readSymbols = () =>
    create.mutate(dreamId, {
      onSuccess: (result) => router.push(`/analysis/${result.reportId}`),
    });

  return (
    <section aria-labelledby={headingId} className="mt-12">
      <h2 id={headingId} className="font-serif text-lg text-text-primary">
        이 꿈의 상징
      </h2>
      <p className="mt-2 break-keep text-sm leading-relaxed text-text-secondary">
        꿈에 나온 상징과 감정을 읽어 드려요. 진단이 아니라 스스로 돌아보는 참고용이에요.
      </p>

      <div className="mt-5">
        {reading.isPending ? (
          <div className="h-11" aria-hidden />
        ) : reportId ? (
          <Link href={`/analysis/${reportId}`} className={actionClass}>
            상징 리포트 보기
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Link>
        ) : (
          // 조회가 실패해도 버튼을 보여 준다. 이미 리포트가 있으면 서버가 그 id를 돌려준다.
          <button
            type="button"
            className={actionClass}
            disabled={create.isPending}
            aria-busy={create.isPending}
            onClick={readSymbols}
          >
            {create.isError ? "다시 시도" : "이 꿈의 상징 읽기"}
          </button>
        )}
      </div>

      <p role="status" className="mt-3 break-keep text-sm text-text-secondary">
        {create.isPending ? "상징을 읽고 있어요… 보통 10초 안팎이에요" : ""}
      </p>
      {create.isError && (
        <p role="alert" className="mt-3 break-keep text-sm leading-relaxed text-text-primary">
          상징을 읽지 못했어요. {create.error.message}
        </p>
      )}
    </section>
  );
}

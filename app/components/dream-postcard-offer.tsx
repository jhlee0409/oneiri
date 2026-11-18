"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  POSTCARD_OFFER_VERSION,
  type PostcardAction,
  type PostcardStatus,
} from "@/lib/postcard-offer";
import { supabase } from "@/utils/supabase/client";
import { DREAM_POSTCARD_SAMPLE } from "./dream-postcard-sample";

async function recordPostcardAction(
  dreamId: string,
  action: PostcardAction,
): Promise<PostcardStatus> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("로그인 후 다시 시도해 주세요.");

  const response = await fetch("/api/dreams/postcard", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dreamId, action, version: POSTCARD_OFFER_VERSION }),
  });
  if (response.status === 401) throw new Error("로그인 후 다시 시도해 주세요.");
  if (!response.ok) throw new Error("기록을 저장하지 못했어요. 다시 시도해 주세요.");
  const result: { status: PostcardStatus } = await response.json();
  return result.status;
}

const actionClass =
  "min-h-12 rounded-lg border border-text-secondary/40 px-4 py-2 text-sm font-medium oneiri-text-primary hover:bg-text-secondary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";

function PostcardOffer({ dreamId }: { dreamId: string }) {
  const [opened, setOpened] = useState(false);
  const [status, setStatus] = useState<PostcardStatus>();
  const [sampleReady, setSampleReady] = useState(false);
  const sampleRef = useRef<HTMLIFrameElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);
  const { mutate, isPending, error, variables } = useMutation({
    mutationFn: (action: PostcardAction) => recordPostcardAction(dreamId, action),
    onSuccess: setStatus,
  });

  useEffect(() => {
    const price = priceRef.current;
    if (!opened || !price) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.intersectionRatio !== 1 || !price.closest("details")?.open) return;
      observer.disconnect();
      mutate("show");
    }, { threshold: 1 });
    observer.observe(price);
    return () => observer.disconnect();
  }, [opened, mutate]);

  return (
    <details
      className="oneiri-bg-secondary mb-12 rounded-lg px-5 py-2 sm:px-6"
      onToggle={(event) => {
        if (!event.currentTarget.open || opened) return;
        setOpened(true);
      }}
    >
      <summary className="min-h-12 cursor-pointer py-3 font-medium oneiri-text-primary focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        꿈 엽서 실험 미리보기
      </summary>
      <div className="space-y-4 pb-4 pt-2">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold oneiri-text-primary">
            <span ref={priceRef} className="inline-block">꿈 엽서 · 3,900원</span>
          </h2>
          <p className="break-keep text-sm leading-relaxed oneiri-text-secondary">
            3,900원은 실험용 가격이에요. 지금은 판매하지 않으며, 로그인한 계정에 관심 신청만 기록해요. 결제는 없어요.
          </p>
        </div>
        {opened && (
          <figure className="max-w-md space-y-2">
            <iframe
              ref={sampleRef}
              srcDoc={DREAM_POSTCARD_SAMPLE}
              title="인쇄용 꿈 엽서 샘플: 달빛 정거장"
              onLoad={() => setSampleReady(true)}
              className="block aspect-[148/105] w-full rounded-sm"
            />
            <figcaption className="break-keep text-sm oneiri-text-secondary">
              가상의 꿈으로 만든 148 × 105 mm 엽서예요. 내 꿈 내용은 사용하지 않아요.
            </figcaption>
          </figure>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={actionClass}
            disabled={!sampleReady}
            onClick={() => sampleRef.current?.contentWindow?.print()}
          >
            샘플 인쇄
          </button>
          {status !== "signed_up" && status !== "cohort_full" && (
            <button
              type="button"
              className={`${actionClass} oneiri-accent-bg !text-bg-primary`}
              disabled={status !== "shown" || isPending}
              onClick={() => mutate("signup")}
            >
              {isPending && variables === "signup" ? "신청을 기록하는 중…" : "이 가격에 관심 신청하기"}
            </button>
          )}
          {error && variables === "show" && (
            <button type="button" className={actionClass} onClick={() => mutate("show")}>
              다시 시도
            </button>
          )}
        </div>
        <div role="status" className="text-sm oneiri-text-primary">
          {isPending && variables === "show" && "참여 가능 여부를 확인하고 있어요."}
          {status === "signed_up" && "관심 신청을 기록했어요. 결제는 없어요."}
          {status === "cohort_full" && "이번 실험의 참여 인원이 찼어요. 샘플은 인쇄할 수 있어요."}
        </div>
        {error && <p role="alert" className="text-sm oneiri-text-primary">{error.message}</p>}
      </div>
    </details>
  );
}

export default function DreamPostcardOffer({
  dreamId,
  ownerId,
}: {
  dreamId: string;
  ownerId: string | null;
}) {
  const { user } = useAuth();
  if (!user || user.is_anonymous || user.id !== ownerId) return null;
  return <PostcardOffer key={`${user.id}:${dreamId}`} dreamId={dreamId} />;
}

"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export type DreamImageState = "ready" | "drawing" | "failed" | "none";

interface DreamPageProps {
  title: string | null;
  createdAt: string | null;
  content: string | null;
  imageUrl: string | null;
  /** imageUrl이 없을 때 이미지 자리에 보여줄 상태 */
  imageState: DreamImageState;
  /** 날짜 뒤에 가운뎃점으로 이어 붙일 짧은 정보(감정, 분위기) */
  details?: (string | null | undefined)[];
  /** 날짜 아래 줄(공개 화면의 작성자) */
  byline?: ReactNode;
  sourceLabel: string;
  sourceText: string | null;
  keywords?: string[] | null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function splitParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function ImageSlotMessage({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="relative flex aspect-video w-full items-center justify-center bg-ink/[0.06]"
    >
      <p className="px-6 text-center font-serif text-[15px] text-ink/70 break-keep">
        {children}
      </p>
    </div>
  );
}

/**
 * 꿈 한 편을 종이 한 장처럼 보여주는 읽기 레이아웃.
 * 장면(이미지) → 제목 → 날짜 → 본문 순서이며, 아래에 사용자가 적은 원문을 덧붙인다.
 */
export default function DreamPage({
  title,
  createdAt,
  content,
  imageUrl,
  imageState,
  details = [],
  byline,
  sourceLabel,
  sourceText,
  keywords,
}: DreamPageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const displayTitle = title || "무제";
  const paragraphs = content ? splitParagraphs(content) : [];
  const metaParts = details.filter((part): part is string => !!part);

  let imageSlot: ReactNode = null;
  if (imageUrl && !imageFailed) {
    imageSlot = (
      <Zoom
        a11yNameButtonZoom="장면 크게 보기"
        a11yNameButtonUnzoom="크게 보기 닫기"
      >
        <Image
          src={imageUrl}
          alt={`${displayTitle}의 장면`}
          width={1344}
          height={768}
          priority
          sizes="(max-width:768px) 100vw, 720px"
          className="block h-auto w-full bg-ink/[0.06]"
          onError={() => setImageFailed(true)}
        />
      </Zoom>
    );
  } else if (imageUrl) {
    imageSlot = <ImageSlotMessage>장면을 불러오지 못했어요.</ImageSlotMessage>;
  } else if (imageState === "drawing") {
    imageSlot = (
      <div
        role="status"
        className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-ink/[0.06]"
      >
        <div
          aria-hidden
          className="absolute inset-0 animate-pulse bg-ink/[0.05] motion-reduce:animate-none"
        />
        <p className="relative font-serif text-[15px] text-ink/70">
          장면을 그리고 있어요…
        </p>
      </div>
    );
  } else if (imageState === "failed") {
    imageSlot = (
      <ImageSlotMessage>
        장면을 그리지 못했어요. 다음에 열 때 다시 그려 볼게요.
      </ImageSlotMessage>
    );
  }

  return (
    <>
      <article className="overflow-hidden bg-paper text-ink sm:rounded-lg">
        {imageSlot}

        <div className="px-6 pb-12 pt-8 text-[17px] sm:px-12 sm:pb-16 sm:pt-10 sm:text-[18px]">
          <div className="mx-auto max-w-[34em]">
            <header>
              <h1 className="font-serif text-[28px] leading-snug text-ink break-keep text-balance sm:text-[34px]">
                {displayTitle}
              </h1>
              {(createdAt || metaParts.length > 0) && (
                <p className="mt-3 text-sm tabular-nums text-ink/70 break-keep">
                  {createdAt && (
                    <time dateTime={createdAt}>{formatDate(createdAt)}</time>
                  )}
                  {metaParts.map((part, index) => (
                    <span key={index}>
                      {(createdAt || index > 0) && (
                        <span aria-hidden className="mx-1.5">
                          ·
                        </span>
                      )}
                      {part}
                    </span>
                  ))}
                </p>
              )}
              {byline}
            </header>

            <div className="mt-8 space-y-[1.1em] font-serif leading-[1.9] text-ink/90 break-keep">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-ink/70">아직 이야기가 쓰이지 않았어요.</p>
              )}
            </div>
          </div>
        </div>
      </article>

      {sourceText && (
        <section className="mt-8 px-6 sm:px-12">
          <h2 className="text-xs text-text-secondary">{sourceLabel}</h2>
          <blockquote className="mt-2 border-l border-line pl-4 text-sm leading-relaxed text-text-secondary whitespace-pre-line break-keep">
            {sourceText}
          </blockquote>
          {keywords && keywords.length > 0 && (
            <p className="mt-3 pl-4 text-xs text-text-secondary/80 break-keep">
              {keywords.join(" · ")}
            </p>
          )}
        </section>
      )}
    </>
  );
}

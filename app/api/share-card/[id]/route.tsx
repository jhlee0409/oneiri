import { ImageResponse } from "next/og";
import {
  getPublicDream,
  storyExcerpt,
  truncateText,
} from "@/lib/server/public-dream";
import {
  BRAND,
  SERIF_FONT,
  SHARE_IMAGE_CACHE_CONTROL,
  WORDMARK_FONT,
  collectFonts,
  loadDreamImageDataUrl,
  loadShareImageFonts,
} from "@/lib/server/share-image-assets";

const WIDTH = 1080;
const HEIGHT = 1920;
const PADDING = 80;
const IMAGE_WIDTH = WIDTH - PADDING * 2;
const IMAGE_HEIGHT = Math.round((IMAGE_WIDTH * 9) / 16);
const FOOTER = "oneiri.app · 꿈이 이야기가 되는 곳";

/** 인스타그램 스토리용 1080x1920 공유 카드. 공개 꿈만 렌더링한다. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dream = await getPublicDream(id);
  if (!dream) {
    return new Response("Not Found", { status: 404 });
  }

  const title = truncateText(dream.title, 40);
  const excerpt = dream.content ? storyExcerpt(dream.content, 3, 150) : "";
  const [fonts, imageDataUrl] = await Promise.all([
    loadShareImageFonts(`${title}${excerpt}${FOOTER}`),
    loadDreamImageDataUrl(dream.imageUrl),
  ]);
  if (!fonts.serif) {
    return new Response("Font unavailable", { status: 503 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: `112px ${PADDING}px 120px`,
          background: `linear-gradient(180deg, ${BRAND.abyss} 0%, ${BRAND.night} 100%)`,
          fontFamily: SERIF_FONT,
          color: BRAND.starlight,
        }}
      >
        <div
          style={{
            display: "flex",
            color: BRAND.golden,
            fontSize: fonts.wordmark ? 120 : 72,
            fontFamily: fonts.wordmark ? WORDMARK_FONT : undefined,
            lineHeight: 1,
          }}
        >
          Oneiri
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: IMAGE_WIDTH,
            gap: 56,
          }}
        >
          {imageDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageDataUrl}
              alt=""
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              style={{
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                objectFit: "cover",
                borderRadius: 24,
                border: `2px solid rgba(212,175,55,0.35)`,
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {title}
          </div>
          {excerpt && (
            <div
              style={{
                display: "flex",
                fontSize: 40,
                lineHeight: 1.65,
                color: "rgba(240,240,240,0.82)",
              }}
            >
              {excerpt}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: BRAND.golden,
          }}
        >
          {FOOTER}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: collectFonts(fonts),
      headers: {
        "Cache-Control": SHARE_IMAGE_CACHE_CONTROL,
        "Content-Disposition": `inline; filename="oneiri-${dream.id}.png"`,
      },
    }
  );
}

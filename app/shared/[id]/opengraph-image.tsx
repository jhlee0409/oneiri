import { ImageResponse } from "next/og";
import { getPublicDream, truncateText } from "@/lib/server/public-dream";
import {
  BRAND,
  SERIF_FONT,
  SHARE_IMAGE_CACHE_CONTROL,
  WORDMARK_FONT,
  collectFonts,
  loadDreamImageDataUrl,
  loadShareImageFonts,
  type ShareImageFonts,
} from "@/lib/server/share-image-assets";

export const alt = "Oneiri 꿈 이야기";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TAGLINE = "꿈이 이야기가 되는 곳";

function Wordmark({
  fonts,
  fontSize,
}: {
  fonts: ShareImageFonts;
  fontSize: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        color: BRAND.golden,
        fontSize,
        fontFamily: fonts.wordmark ? WORDMARK_FONT : undefined,
        lineHeight: 1,
      }}
    >
      Oneiri
    </div>
  );
}

/** 비공개·없는 꿈, 또는 한글 폰트를 받지 못했을 때의 브랜드 카드 */
function BrandCard({ fonts }: { fonts: ShareImageFonts }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: `linear-gradient(135deg, ${BRAND.abyss} 0%, ${BRAND.night} 100%)`,
      }}
    >
      <Wordmark fonts={fonts} fontSize={fonts.wordmark ? 180 : 120} />
      {fonts.serif && (
        <div
          style={{
            display: "flex",
            color: BRAND.starlight,
            fontFamily: SERIF_FONT,
            fontSize: 40,
          }}
        >
          {TAGLINE}
        </div>
      )}
      <div style={{ display: "flex", color: BRAND.shadow, fontSize: 28 }}>
        oneiri.app
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: { id: string } }) {
  const dream = await getPublicDream(params.id);
  const title = dream ? truncateText(dream.title, 40) : "";
  const excerpt = dream?.content ? truncateText(dream.content, 90) : "";

  const [fonts, imageDataUrl] = await Promise.all([
    loadShareImageFonts(`${title}${excerpt} · ${TAGLINE}oneiri.app`),
    dream ? loadDreamImageDataUrl(dream.imageUrl) : Promise.resolve(null),
  ]);
  const options = {
    ...size,
    fonts: collectFonts(fonts),
    headers: { "Cache-Control": SHARE_IMAGE_CACHE_CONTROL },
  };

  if (!dream || !fonts.serif) {
    return new ImageResponse(<BrandCard fonts={fonts} />, options);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: `linear-gradient(135deg, ${BRAND.abyss} 0%, ${BRAND.night} 100%)`,
          fontFamily: SERIF_FONT,
        }}
      >
        {imageDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageDataUrl}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size.width,
              height: size.height,
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            display: "flex",
            background:
              "linear-gradient(to top, rgba(13,13,26,0.96) 0%, rgba(13,13,26,0.7) 50%, rgba(13,13,26,0.35) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 64,
            display: "flex",
          }}
        >
          <Wordmark fonts={fonts} fontSize={fonts.wordmark ? 84 : 52} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 56,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              color: BRAND.starlight,
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.25,
            }}
          >
            {title}
          </div>
          {excerpt && (
            <div
              style={{
                display: "flex",
                color: "rgba(240,240,240,0.82)",
                fontSize: 28,
                lineHeight: 1.5,
              }}
            >
              {excerpt}
            </div>
          )}
          <div
            style={{
              display: "flex",
              color: BRAND.golden,
              fontSize: 24,
              marginTop: 4,
            }}
          >
            {`oneiri.app · ${TAGLINE}`}
          </div>
        </div>
      </div>
    ),
    options
  );
}

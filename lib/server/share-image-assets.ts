/** next/og(ImageResponse) 렌더링에 필요한 폰트·이미지 로더. 실패 시 null을 돌려 대체 카드로 렌더링한다. */

type FontWeight = 400 | 700;

export interface ShareImageFont {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: "normal";
}

export const SERIF_FONT = "Gowun Batang";
export const WORDMARK_FONT = "Italianno";

export const BRAND = {
  abyss: "#0D0D1A",
  night: "#1A1A2E",
  golden: "#D4AF37",
  starlight: "#F0F0F0",
  shadow: "#8A8A9E",
} as const;

/**
 * Google Fonts에서 `text=` 서브셋 TTF를 받아온다. Node fetch의 UA에는 truetype CSS가 내려온다.
 * 서브셋 URL은 텍스트별로 고유하므로 Data Cache에 저장해 재요청을 피한다.
 */
async function loadGoogleFont(
  family: string,
  weight: FontWeight,
  text: string
): Promise<ShareImageFont | null> {
  try {
    const subset = Array.from(new Set(Array.from(text))).join("");
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(
      / /g,
      "+"
    )}:wght@${weight}&text=${encodeURIComponent(subset)}`;
    const cssResponse = await fetch(cssUrl, { cache: "force-cache" });
    if (!cssResponse.ok) return null;

    const css = await cssResponse.text();
    const fontUrl = css.match(
      /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/
    )?.[1];
    if (!fontUrl) return null;

    const fontResponse = await fetch(fontUrl, { cache: "force-cache" });
    if (!fontResponse.ok) return null;

    return {
      name: family,
      data: await fontResponse.arrayBuffer(),
      weight,
      style: "normal",
    };
  } catch (error) {
    console.error(`Failed to load font ${family} ${weight}:`, error);
    return null;
  }
}

export interface ShareImageFonts {
  /** 한글 본문 폰트(400·700). 없으면 한글을 그릴 수 없으므로 브랜드 카드로 대체한다. */
  serif: ShareImageFont[] | null;
  wordmark: ShareImageFont | null;
}

export async function loadShareImageFonts(
  text: string
): Promise<ShareImageFonts> {
  const [regular, bold, wordmark] = await Promise.all([
    loadGoogleFont(SERIF_FONT, 400, text),
    loadGoogleFont(SERIF_FONT, 700, text),
    loadGoogleFont(WORDMARK_FONT, 400, "Oneiri"),
  ]);
  return {
    serif: regular && bold ? [regular, bold] : null,
    wordmark,
  };
}

export function collectFonts(fonts: ShareImageFonts): ShareImageFont[] {
  return [...(fonts.serif ?? []), ...(fonts.wordmark ? [fonts.wordmark] : [])];
}

const SUPPORTED_IMAGE_TYPES: Record<string, true> = {
  "image/png": true,
  "image/jpeg": true,
};

/**
 * 꿈 이미지를 data URL로 받아온다. Supabase 스토리지 출처만 허용한다.
 * 이미지가 수 MB라 Data Cache(2MB 제한)에 넣지 않는다.
 */
export async function loadDreamImageDataUrl(
  imageUrl: string | null
): Promise<string | null> {
  if (!imageUrl) return null;
  try {
    const supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!)
      .origin;
    if (new URL(imageUrl).origin !== supabaseOrigin) return null;

    const response = await fetch(imageUrl, { cache: "no-store" });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type")?.split(";")[0];
    if (!contentType || !SUPPORTED_IMAGE_TYPES[contentType]) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Failed to load dream image:", error);
    return null;
  }
}

/** 공개 상태가 바뀔 수 있으므로 CDN 캐시는 짧게 둔다. */
export const SHARE_IMAGE_CACHE_CONTROL =
  "public, max-age=0, s-maxage=3600, must-revalidate";

import type { Metadata } from "next";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { createAdminClient } from "./supabase-admin";

export const SITE_URL = "https://www.oneiri.app";

export const sharedDreamUrl = (id: string) => `${SITE_URL}/shared/${id}`;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PublicDream {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  authorName: string | null;
}

interface AuthorProfile {
  id: string;
  display_name: string | null;
  deleted_at: string | null;
}

/**
 * 쿠키 없는 anon 클라이언트. RLS가 그대로 적용되므로 로그인한 소유자의 세션으로
 * 비공개 꿈이 메타데이터·이미지에 섞여 들어갈 수 없다.
 */
function createAnonClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * user_profiles는 anon RLS로 읽을 수 없어 service role로 조회한다.
 * 이미 공개로 확인된 꿈의 작성자에 대해 display_name/deleted_at만 선택한다.
 */
async function getAuthorProfiles(userIds: string[]): Promise<AuthorProfile[]> {
  if (userIds.length === 0) return [];
  try {
    const { data, error } = await createAdminClient()
      .from("user_profiles")
      .select("id, display_name, deleted_at")
      .in("id", userIds)
      .returns<AuthorProfile[]>();
    if (error) {
      console.error("Failed to fetch author profiles:", error);
      return [];
    }
    return data ?? [];
  } catch (error) {
    console.error("Failed to fetch author profiles:", error);
    return [];
  }
}

/** 공개 상태이고 작성자 계정이 탈퇴(soft delete)되지 않은 꿈만 반환한다. */
export const getPublicDream = cache(
  async (id: string): Promise<PublicDream | null> => {
    if (!UUID_RE.test(id)) return null;

    const { data, error } = await createAnonClient()
      .from("dreams")
      .select(
        "id, user_id, generated_story_title, generated_story_content, generated_image_url, created_at, updated_at"
      )
      .eq("id", id)
      .eq("is_public", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching public dream:", error);
      return null;
    }
    if (!data) return null;

    const [author] = await getAuthorProfiles([data.user_id]);
    if (author?.deleted_at) return null;

    return {
      id: data.id,
      title: data.generated_story_title?.trim() || "제목 없는 꿈",
      content: normalizeStoryText(data.generated_story_content ?? ""),
      imageUrl: data.generated_image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      authorName: author?.display_name?.trim() || null,
    };
  }
);

/** 사이트맵용: 공개 꿈 중 작성자가 탈퇴하지 않은 것의 id와 수정 시각 */
export async function listPublicDreams(): Promise<
  { id: string; lastModified: string | null }[]
> {
  const { data, error } = await createAnonClient()
    .from("dreams")
    .select("id, user_id, created_at, updated_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching public dreams for sitemap:", error);
    return [];
  }
  if (!data) return [];

  const authors = await getAuthorProfiles([
    ...new Set(data.map((dream) => dream.user_id)),
  ]);
  const deletedAuthors = new Set(
    authors.filter((author) => author.deleted_at).map((author) => author.id)
  );

  return data
    .filter((dream) => !deletedAuthors.has(dream.user_id))
    .map((dream) => ({
      id: dream.id,
      lastModified: dream.updated_at ?? dream.created_at,
    }));
}

/** 마크다운 기호와 연속 공백을 정리해 한 줄 텍스트로 만든다. */
function normalizeStoryText(text: string): string {
  return text
    .replace(/[#*_>`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** 코드 포인트 기준으로 자르고 말줄임표를 붙인다. */
export function truncateText(text: string, maxChars: number): string {
  const chars = Array.from(text);
  if (chars.length <= maxChars) return text;
  return `${chars.slice(0, maxChars).join("").trimEnd()}…`;
}

/** 앞부분 문장 몇 개를 maxChars 안에서 발췌한다. */
export function storyExcerpt(
  content: string,
  maxSentences: number,
  maxChars: number
): string {
  const sentences = content.match(/[^.!?。…]+[.!?。…]+["'”’」』)]*\s*/g);
  if (!sentences) return truncateText(content, maxChars);

  let excerpt = "";
  for (const sentence of sentences.slice(0, maxSentences)) {
    if (excerpt && Array.from(excerpt + sentence).length > maxChars) break;
    excerpt += sentence;
  }
  return truncateText(excerpt.trim(), maxChars);
}

const NOT_FOUND_METADATA: Metadata = {
  title: "꿈을 찾을 수 없습니다",
  description: "요청하신 꿈 이야기를 찾을 수 없습니다.",
  robots: { index: false, follow: false },
};

/**
 * 공개 꿈 페이지 메타데이터. 공개가 아니거나 없는 꿈은 내용을 노출하지 않고 noindex 처리한다.
 * canonical은 항상 /shared/{id}로 모은다.
 */
export async function buildPublicDreamMetadata(
  id: string,
  { includeImage }: { includeImage: boolean }
): Promise<Metadata> {
  const dream = await getPublicDream(id);
  if (!dream) return NOT_FOUND_METADATA;

  const url = sharedDreamUrl(dream.id);
  const description = dream.content
    ? truncateText(dream.content, 120)
    : "Oneiri에서 공유된 꿈 이야기";
  // /shared/[id]는 opengraph-image 파일 규칙이 이미지를 붙인다. images 키가 있으면
  // (undefined라도) 파일 기반 이미지가 무시되므로 키 자체를 생략한다.
  const imageUrl = `${url}/opengraph-image`;
  const ogImages = includeImage
    ? {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: dream.title }],
      }
    : {};
  const twitterImages = includeImage ? { images: [imageUrl] } : {};

  return {
    title: dream.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: "Oneiri",
      locale: "ko_KR",
      title: dream.title,
      description,
      publishedTime: dream.createdAt ?? undefined,
      modifiedTime: dream.updatedAt ?? undefined,
      authors: dream.authorName ? [dream.authorName] : undefined,
      ...ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: dream.title,
      description,
      ...twitterImages,
    },
  };
}

/** schema.org Article JSON-LD. `<`는 이스케이프해 스크립트 태그 탈출을 막는다. */
export function publicDreamJsonLd(dream: PublicDream): string {
  const url = sharedDreamUrl(dream.id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: truncateText(dream.title, 110),
    description: dream.content ? truncateText(dream.content, 120) : undefined,
    url,
    mainEntityOfPage: url,
    image: [dream.imageUrl ?? `${url}/opengraph-image`],
    datePublished: dream.createdAt ?? undefined,
    dateModified: dream.updatedAt ?? dream.createdAt ?? undefined,
    inLanguage: "ko-KR",
    author: {
      "@type": "Person",
      name: dream.authorName ?? "Oneiri 사용자",
    },
    publisher: {
      "@type": "Organization",
      name: "Oneiri",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/oneiri_logo.png` },
    },
  };
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

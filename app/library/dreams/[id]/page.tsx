import type { Metadata } from "next";
import AuthGuard from "../../../components/auth-guard";
import DreamStoryDisplay from "../../../components/dream-story-display";
import { createClient } from "@/utils/supabase/server";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// DB에서 스토리 데이터를 가져오는 함수
async function getStoryData(storyId: string) {
  try {
    const supabase = await createClient();
    const { data: story, error } = await supabase
      .from("dreams")
      .select("*")
      .eq("id", storyId)
      .single();

    if (error) {
      console.error("Error fetching story for metadata:", error);
      return null;
    }

    return story;
  } catch (error) {
    console.error("Failed to fetch story for metadata:", error);
    return null;
  }
}

// generateMetadata 함수를 사용하여 동적으로 메타데이터를 생성
export async function generateMetadata(
  props: {
    params: Promise<{ id: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const story = await getStoryData(params.id);

  if (!story) {
    return {
      title: "찾을 수 없는 이야기",
      description: "요청하신 꿈 이야기를 찾을 수 없습니다.",
    };
  }

  // 이야기 내용의 일부를 잘라 설명으로 사용
  const description = story.generated_story_content
    ? story.generated_story_content.substring(0, 155) + "..."
    : "신비로운 꿈의 세계로 떠나는 특별한 이야기입니다.";

  // 이미지 URL이 있다면 사용, 없다면 기본 이미지 사용
  const imageUrl = story.generated_image_url || "/og-image.jpg";

  return {
    title: story.generated_story_title || "무제",
    description: description,
    keywords: story.dream_keywords || [], // 검색엔진을 위한 키워드

    // 이 페이지에 특화된 소셜 공유 정보
    openGraph: {
      title: `${story.generated_story_title || "무제"} | Oneiri`,
      description: description,
      // 개별 스토리의 AI 생성 이미지를 공유 이미지로 사용
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `AI generated art for the story: ${
            story.generated_story_title || "무제"
          }`,
        },
      ],
      type: "article",
      publishedTime: story.created_at,
      modifiedTime: story.updated_at,
    },

    twitter: {
      title: `${story.generated_story_title || "무제"} | Oneiri`,
      description: description,
      images: [imageUrl],
    },

    // 추가 메타데이터
    authors: [{ name: "Oneiri User" }],
    category: "꿈 이야기",
  };
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default async function DreamStoryDetailPage(props: PageProps) {
  const params = await props.params;
  // UUID 형식이 아닌 경우 에러 페이지 표시
  if (!isValidUUID(params.id)) {
    return (
      <div className="min-h-screen oneiri-bg-primary">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center py-24">
            <h2 className="text-xl font-medium oneiri-text-primary mb-4">
              잘못된 링크입니다
            </h2>
            <p className="oneiri-text-secondary mb-6">
              올바른 꿈 이야기 링크가 아닙니다.
            </p>
            <a
              href="/library/dreams"
              className="inline-flex items-center oneiri-accent hover:text-accent-primary/80 transition-colors"
            >
              꿈 서재로 돌아가기
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen oneiri-bg-primary">
        <DreamStoryDisplay storyId={params.id} />
      </div>
    </AuthGuard>
  );
}
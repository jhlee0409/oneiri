import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DreamStoryDisplay from "../../components/dream-story-display";
import { createClient } from "@/utils/supabase/server";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// DB에서 공개 스토리 데이터를 가져오는 함수
async function getPublicStoryData(storyId: string) {
  try {
    const supabase = await createClient();
    const { data: story, error } = await supabase
      .from("dreams")
      .select("*")
      .eq("id", storyId)
      .eq("is_public", true)
      .single();

    if (error) {
      console.error("Error fetching public story:", error);
      return null;
    }

    return story;
  } catch (error) {
    console.error("Failed to fetch public story:", error);
    return null;
  }
}

// generateMetadata 함수를 사용하여 동적으로 메타데이터를 생성
export async function generateMetadata(
  props: {
    params: Promise<{
      id: string;
    }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  
  const story = await getPublicStoryData(params.id);

  if (!story) {
    return {
      title: "꿈을 찾을 수 없습니다 | 오네이리",
      description: "요청하신 꿈 이야기를 찾을 수 없습니다.",
    };
  }

  const title = story.generated_story_title || "제목 없는 꿈";
  const description = story.generated_story_content?.substring(0, 160) || story.dream_input_text?.substring(0, 160) || "꿈의 이야기";

  return {
    title: `${title} | 오네이리`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://oneiri.vercel.app/shared/${params.id}`,
      images: story.generated_image_url ? [
        {
          url: story.generated_image_url,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: story.generated_image_url ? [story.generated_image_url] : [],
    },
  };
}

export default async function SharedDreamPage(props: PageProps) {
  const params = await props.params;
  const story = await getPublicStoryData(params.id);

  if (!story) {
    notFound();
  }

  return <DreamStoryDisplay dreamId={params.id} isPublicView />;
}
import { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

// 모든 스토리의 ID 목록을 가져오는 함수
async function getAllStoryIds() {
  try {
    const supabase = await createClient();
    const { data: stories, error } = await supabase
      .from("dreams")
      .select("id, updated_at")
      .eq("is_public", true); // 공개된 스토리만

    if (error) {
      console.error("Error fetching stories for sitemap:", error);
      return [];
    }

    return stories || [];
  } catch (error) {
    console.error("Failed to fetch stories for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getAllStoryIds();

  // 개별 스토리 페이지들의 사이트맵 엔트리
  const storyEntries: MetadataRoute.Sitemap = stories.map(
    ({ id, updated_at }) => ({
      url: `https://oneiri.vercel.app/library/dreams/${id}`,
      lastModified: new Date(updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // 기본 페이지들
  return [
    {
      url: "https://oneiri.vercel.app",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: "https://oneiri.vercel.app/explore",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: "https://oneiri.vercel.app/create",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: "https://oneiri.vercel.app/profile",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...storyEntries,
  ];
}

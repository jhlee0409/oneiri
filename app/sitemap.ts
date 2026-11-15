import { MetadataRoute } from "next";
import {
  SITE_URL,
  listPublicDreams,
  sharedDreamUrl,
} from "@/lib/server/public-dream";

// 새로 공개된 꿈이 반영되도록 한 시간마다 다시 생성한다.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dreams = await listPublicDreams();

  // 공개 꿈은 /shared/{id}가 canonical이다.
  const dreamEntries: MetadataRoute.Sitemap = dreams.map(
    ({ id, lastModified }) => ({
      url: sharedDreamUrl(id),
      lastModified: lastModified ? new Date(lastModified) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shared`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/dreams`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/notices`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticPages, ...dreamEntries];
}

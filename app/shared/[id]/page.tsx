import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SharedDreamDisplay from "../../components/dream-shared-display";
import {
  buildPublicDreamMetadata,
  getPublicDream,
  publicDreamJsonLd,
} from "@/lib/server/public-dream";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// og:image·twitter:image는 같은 세그먼트의 opengraph-image.tsx가 자동으로 붙인다.
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  return buildPublicDreamMetadata(id, { includeImage: false });
}

export default async function SharedDreamPage(props: PageProps) {
  const { id } = await props.params;
  const dream = await getPublicDream(id);

  if (!dream) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: publicDreamJsonLd(dream) }}
      />
      <SharedDreamDisplay dreamId={id} />
    </>
  );
}

import Link from "next/link";
import DreamSharedDisplay from "@/app/components/dream-shared-display";
import { buildPublicDreamMetadata } from "@/lib/server/public-dream";
import { Metadata } from "next";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

// 공개 꿈만 메타데이터를 노출하고 canonical은 /shared/{id}로 모은다.
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  return buildPublicDreamMetadata(id, { includeImage: true });
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default async function DreamPage(props: PageProps) {
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
            <Link
              href="/library/dreams"
              className="inline-flex items-center oneiri-accent hover:text-accent-primary/80 transition-colors"
            >
              꿈 서재로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen oneiri-bg-primary">
      <DreamSharedDisplay dreamId={params.id} />
    </div>
  );
}

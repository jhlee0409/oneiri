import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface ViewPublicPageButtonProps {
  dreamId: string;
  isPublic: boolean;
}

export default function ViewPublicPageButton({
  dreamId,
  isPublic,
}: ViewPublicPageButtonProps) {
  if (!isPublic) {
    return null;
  }

  return (
    <Link
      href={`/dreams/${dreamId}`}
      className="inline-flex items-center gap-1.5 text-sm oneiri-text-secondary hover:oneiri-accent transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalLink className="w-4 h-4" />
      <span>공유 페이지 보기</span>
    </Link>
  );
}

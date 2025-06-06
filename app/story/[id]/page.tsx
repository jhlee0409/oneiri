import AuthGuard from "../../components/auth-guard";
import DreamStoryDisplay from "../../components/dream-story-display";

interface PageProps {
  params: {
    id: string;
  };
}

export default function StoryDetailPage({ params }: PageProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <DreamStoryDisplay storyId={params.id} />
      </div>
    </AuthGuard>
  );
}

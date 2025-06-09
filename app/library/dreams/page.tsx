import AuthGuard from "@/app/components/auth-guard";
import DreamJournal from "../../components/dream-journal";

export default function DreamLibraryPage() {
  return (
    <AuthGuard>
      <DreamJournal />
    </AuthGuard>
  );
}

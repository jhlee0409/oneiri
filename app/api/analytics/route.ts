import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";

interface RecentDream {
  created_at: string;
  dream_emotion: string | null;
  story_preference_genre: string | null;
  processing_status: string | null;
}

interface TaggedDream {
  dream_tags: { tags: { name: string } | null }[] | null;
}

interface WeeklyActivity {
  week: string;
  dreams: number;
  startDate: string;
  endDate: string;
}

function countBy(
  dreams: RecentDream[],
  key: "dream_emotion" | "story_preference_genre" | "processing_status"
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const dream of dreams) {
    const value = dream[key];
    if (value) counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function sortedByCount(counts: Record<string, number>): [string, number][] {
  return Object.entries(counts).sort(([, a], [, b]) => b - a);
}

/** Consistency score (0-100): 100 minus the coefficient of variation across weeks. */
function calculateConsistencyScore(weeklyActivity: WeeklyActivity[]): number {
  if (weeklyActivity.length === 0) return 0;
  const totalDreams = weeklyActivity.reduce((sum, week) => sum + week.dreams, 0);
  if (totalDreams === 0) return 0;
  const average = totalDreams / weeklyActivity.length;
  const variance =
    weeklyActivity.reduce((sum, week) => sum + Math.pow(week.dreams - average, 2), 0) /
    weeklyActivity.length;
  const coefficientOfVariation = Math.sqrt(variance) / average;
  const consistencyScore = Math.max(0, (1 - coefficientOfVariation) * 100);
  return Math.round(Math.min(100, consistencyScore));
}

export async function GET(request: Request) {
  try {
    if (!request.headers.get("authorization")) {
      return NextResponse.json(
        { success: false, error: "No authorization header" },
        { status: 401 }
      );
    }
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    const { data: userStats, error: statsError } = await supabase.rpc(
      "get_user_dream_stats",
      { user_uuid: user.id }
    );
    if (statsError) throw statsError;

    const { data: recentData, error: dreamsError } = await supabase
      .from("dreams")
      .select("created_at, dream_emotion, story_preference_genre, processing_status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    if (dreamsError) throw dreamsError;
    const recentDreams: RecentDream[] = recentData || [];

    const { data: userTags, error: tagsError } = await supabase
      .from("dreams")
      .select(
        `
        dream_tags(
          tags(name, category, color)
        )
      `
      )
      .eq("user_id", user.id)
      .not("dream_tags", "is", null)
      .limit(20);
    if (tagsError) {
      console.warn("Tags query error:", tagsError);
    }

    const emotionTrends = countBy(recentDreams, "dream_emotion");
    const genrePreferences = countBy(recentDreams, "story_preference_genre");

    const now = new Date();
    const weeklyActivity: WeeklyActivity[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date();
      weekEnd.setDate(now.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 7);
      const weekDreams = recentDreams.filter((dream) => {
        const dreamDate = new Date(dream.created_at);
        return dreamDate >= weekStart && dreamDate < weekEnd;
      }).length;
      weeklyActivity.push({
        week: `Week ${4 - i}`,
        dreams: weekDreams,
        startDate: weekStart.toISOString().split("T")[0],
        endDate: weekEnd.toISOString().split("T")[0],
      });
    }

    const processingStats = countBy(recentDreams, "processing_status");
    const successRate =
      recentDreams.length > 0 && processingStats.completed
        ? ((processingStats.completed / recentDreams.length) * 100).toFixed(1)
        : "0";

    const tagFrequency: Record<string, number> = {};
    for (const dream of (userTags || []) as unknown as TaggedDream[]) {
      for (const tagRelation of dream.dream_tags || []) {
        if (tagRelation.tags) {
          const tagName = tagRelation.tags.name;
          tagFrequency[tagName] = (tagFrequency[tagName] || 0) + 1;
        }
      }
    }
    const topTags = sortedByCount(tagFrequency)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileError) {
      console.warn("Profile query error:", profileError);
    }

    const analytics = {
      ...userStats,
      emotion_trends: emotionTrends,
      genre_preferences: genrePreferences,
      weekly_activity: weeklyActivity,
      processing_success_rate: parseFloat(successRate),
      processing_stats: processingStats,
      top_tags: topTags,
      insights: {
        most_active_emotion: sortedByCount(emotionTrends)[0]?.[0] || null,
        favorite_genre: sortedByCount(genrePreferences)[0]?.[0] || null,
        consistency_score: calculateConsistencyScore(weeklyActivity),
        tag_diversity: Object.keys(tagFrequency).length,
      },
      preferences: {
        default_genre: userProfile?.preferred_story_genre || "mysterious",
        default_length: userProfile?.preferred_story_length || "medium",
        language: userProfile?.default_language || "ko",
        notifications: userProfile?.notifications_enabled ?? true,
      },
    };

    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Error in analytics route:", error);
    const message =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "";
    return NextResponse.json(
      { success: false, error: message || "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";

const ALLOWED_UPDATE_FIELDS = [
  "is_favorite",
  "is_public",
  "dream_keywords",
  "dream_emotion",
  "dream_characters",
  "dream_objects",
] as const;

class HttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Internal server error";
}

function errorResponse(error: unknown) {
  console.error("Error in dreams route:", error);
  const message = errorMessage(error) || "Internal server error";
  const status =
    error instanceof HttpError
      ? error.status
      : message.includes("not found")
        ? 404
        : message.includes("not allowed")
          ? 405
          : 500;
  return NextResponse.json({ success: false, error: message }, { status });
}

async function requireUser(request: Request): Promise<User> {
  if (!request.headers.get("authorization")) {
    throw new HttpError("No authorization header", 401);
  }
  const user = await getUserFromRequest(request);
  if (!user) throw new HttpError("Invalid or expired token", 401);
  return user;
}

function requireDreamId(request: Request): string {
  const dreamId = new URL(request.url).searchParams.get("id");
  if (!dreamId) throw new Error("Dream ID is required for this operation");
  return dreamId;
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const supabase = createAdminClient();
    const searchParams = new URL(request.url).searchParams;
    const dreamId = searchParams.get("id");

    if (dreamId) {
      const { data: dream, error: queryError } = await supabase
        .from("dreams_with_details")
        .select("*")
        .eq("id", dreamId)
        .single();
      if (queryError) {
        if (queryError.code === "PGRST116") throw new Error("Dream not found");
        throw queryError;
      }
      return NextResponse.json({ success: true, data: dream });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = (page - 1) * limit;
    const searchQuery = searchParams.get("search") || "";
    const emotion = searchParams.get("emotion") || "";
    const genre = searchParams.get("genre") || "";
    const favorite = searchParams.get("favorite") === "true";
    const sortBy = searchParams.get("sort") || "created_at";
    const sortOrder = searchParams.get("order") || "desc";

    let query = supabase
      .from("dreams_with_details")
      .select("*")
      .eq("user_id", user.id);
    if (searchQuery) {
      query = query.or(
        `dream_input_text.ilike.%${searchQuery}%,generated_story_title.ilike.%${searchQuery}%,generated_story_content.ilike.%${searchQuery}%`
      );
    }
    if (emotion) query = query.eq("dream_emotion", emotion);
    if (genre) query = query.eq("story_preference_genre", genre);
    if (favorite) query = query.eq("is_favorite", true);

    const { data: dreams, error: queryError } = await query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);
    if (queryError) throw queryError;

    const { count: totalCount } = await supabase
      .from("dreams")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      data: dreams,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser(request);
    const dreamId = requireDreamId(request);
    const updates = (await request.json()) as Record<string, unknown>;

    const allowedUpdates: Record<string, unknown> = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (updates[key] !== undefined) allowedUpdates[key] = updates[key];
    }
    if (Object.keys(allowedUpdates).length === 0) {
      throw new Error("No valid updates provided");
    }

    const { data: updatedDream, error: updateError } = await createAdminClient()
      .from("dreams")
      .update(allowedUpdates)
      .eq("id", dreamId)
      .eq("user_id", user.id)
      .select()
      .single();
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: updatedDream });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser(request);
    const dreamId = requireDreamId(request);

    const { error: deleteError } = await createAdminClient()
      .from("dreams")
      .delete()
      .eq("id", dreamId)
      .eq("user_id", user.id);
    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: "Dream deleted successfully",
    });
  } catch (error) {
    return errorResponse(error);
  }
}

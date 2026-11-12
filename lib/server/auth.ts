import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase-admin";

/** Verifies `Authorization: Bearer <access_token>`; returns the user or null. */
export async function getUserFromRequest(request: Request): Promise<User | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const { data, error } = await createAdminClient().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

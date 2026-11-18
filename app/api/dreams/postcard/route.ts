import { NextResponse } from "next/server";
import { POSTCARD_OFFER_VERSION } from "@/lib/postcard-offer";
import { getUserFromRequest } from "@/lib/server/auth";
import { createAdminClient } from "@/lib/server/supabase-admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (
    !body || typeof body !== "object" ||
    !("dreamId" in body) || typeof body.dreamId !== "string" || !UUID.test(body.dreamId) ||
    !("action" in body) || (body.action !== "show" && body.action !== "signup") ||
    !("version" in body) || body.version !== POSTCARD_OFFER_VERSION
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const user = await getUserFromRequest(request);
    if (!user || user.is_anonymous) {
      return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
    }

    const { data, error } = await createAdminClient().rpc("record_dream_postcard_interest", {
      p_offer_version: POSTCARD_OFFER_VERSION,
      p_user_id: user.id,
      p_dream_id: body.dreamId,
      p_action: body.action,
    });
    if (!error) {
      switch (data) {
        case "shown":
        case "signed_up":
        case "cohort_full":
          return NextResponse.json({ status: data });
        case "not_found":
          return NextResponse.json({ error: data }, { status: 404 });
        case "not_shown":
          return NextResponse.json({ error: data }, { status: 409 });
      }
    }
  } catch {
    // Never log request bodies, auth data, or database error details here.
  }
  return NextResponse.json({ error: "unavailable" }, { status: 500 });
}

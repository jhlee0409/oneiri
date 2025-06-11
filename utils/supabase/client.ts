import { createBrowserClient } from "@supabase/ssr";

// Export Supabase URL for use in other components
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Export createClient function for consistency with other patterns
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

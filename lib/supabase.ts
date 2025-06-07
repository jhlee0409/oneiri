import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseHelpers = {
  // Auth helpers
  async signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // Get user session with token
  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },

  // Dream operations
  async generateDreamStory(dreamData: any) {
    const session = await this.getSession();
    if (!session) throw new Error("No authenticated session");

    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-dream-story`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(dreamData),
      }
    );

    return await response.json();
  },

  async getUserDreams(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      emotion?: string;
      genre?: string;
      favorite?: boolean;
    } = {}
  ) {
    const session = await this.getSession();
    if (!session) throw new Error("No authenticated session");

    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.search) params.append("search", options.search);
    if (options.emotion) params.append("emotion", options.emotion);
    if (options.genre) params.append("genre", options.genre);
    if (options.favorite) params.append("favorite", "true");

    const response = await fetch(
      `${supabaseUrl}/functions/v1/manage-dreams?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    return await response.json();
  },

  async getDream(dreamId: string) {
    const session = await this.getSession();
    if (!session) throw new Error("No authenticated session");

    const response = await fetch(
      `${supabaseUrl}/functions/v1/manage-dreams/${dreamId}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    return await response.json();
  },

  async updateDream(dreamId: string, updates: any) {
    const session = await this.getSession();
    if (!session) throw new Error("No authenticated session");

    const response = await fetch(
      `${supabaseUrl}/functions/v1/manage-dreams/${dreamId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      }
    );

    return await response.json();
  },

  async deleteDream(dreamId: string) {
    const session = await this.getSession();
    if (!session) throw new Error("No authenticated session");

    const response = await fetch(
      `${supabaseUrl}/functions/v1/manage-dreams/${dreamId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    return await response.json();
  },

  async getUserAnalytics() {
    const session = await this.getSession();
    if (!session) throw new Error("No authenticated session");

    const response = await fetch(`${supabaseUrl}/functions/v1/user-analytics`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    return await response.json();
  },

  // Tag operations
  async getPopularTags(limit = 20) {
    const { data, error } = await supabase.rpc("get_popular_tags", {
      limit_count: limit,
    });

    if (error) throw error;
    return data;
  },

  async suggestTagsForDream(dreamText: string) {
    const { data, error } = await supabase.rpc("suggest_tags_for_dream", {
      dream_text: dreamText,
    });

    if (error) throw error;
    return data;
  },

  // User profile operations
  async getUserProfile() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("No authenticated user");

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(updates: any) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("No authenticated user");

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Auth state change listener helper
export const onAuthStateChange = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
};

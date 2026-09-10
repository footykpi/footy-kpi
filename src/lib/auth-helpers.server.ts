import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type UserClient = SupabaseClient<Database>;

export interface OwnProfileRef {
  id: string;
  slug: string;
}

/** The signed-in athlete's own profile. Throws when they don't have one yet. */
export async function requireOwnProfile(
  supabase: UserClient,
  userId: string,
): Promise<OwnProfileRef> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, slug")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("You don't have an athlete profile yet.");
  return { id: data.id, slug: data.slug };
}

/** True when the signed-in coach has an accepted link to this athlete. */
export async function isAcceptedCoachFor(
  supabase: UserClient,
  userId: string,
  athleteProfileId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("coach_links")
    .select("id")
    .eq("athlete_profile_id", athleteProfileId)
    .eq("coach_user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();
  return Boolean(data);
}

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

export interface AthleteSearchResult {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  team: string | null;
  position: string | null;
  graduation_year: string | null;
  photo_url: string | null;
  bio: string | null;
}

/** Public athlete search. Only profiles the athlete marked public are returned. */
export const searchAthletes = createServerFn({ method: "GET" })
  .validator(
    z.object({
      q: z.string().trim().max(120).optional(),
      team: z.string().trim().max(120).optional(),
      position: z.string().trim().max(60).optional(),
      graduationYear: z.string().trim().max(10).optional(),
    }),
  )
  .handler(async ({ data }): Promise<AthleteSearchResult[]> => {
    const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
    const supabasePublic = createClient<Database>(process.env['SUPABASE_URL']!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    let query = supabasePublic
      .from("profiles")
      .select("id, slug, first_name, last_name, team, position, graduation_year, photo_url, bio")
      .eq("visibility", "public")
      .limit(60);

    if (data.q) {
      const term = `%${data.q}%`;
      query = query.or(`first_name.ilike.${term},last_name.ilike.${term}`);
    }
    if (data.team) query = query.ilike("team", `%${data.team}%`);
    if (data.position) query = query.ilike("position", `%${data.position}%`);
    if (data.graduationYear) query = query.eq("graduation_year", data.graduationYear);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const { signStoragePath } = await import("@/lib/storage.server");
    return Promise.all(
      ((rows ?? []) as AthleteSearchResult[]).map(async (row) => ({
        ...row,
        photo_url: await signStoragePath(row.photo_url, 60 * 60 * 6),
      })),
    );
  });

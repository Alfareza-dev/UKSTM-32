import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Environment variables – set these in your .env.local file:
//   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

/**
 * Supabase client singleton – safe to use on the **client‑side**.
 *
 * For server‑only operations (e.g. inside Route Handlers or Server Actions)
 * consider creating a dedicated server client with the service‑role key instead.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

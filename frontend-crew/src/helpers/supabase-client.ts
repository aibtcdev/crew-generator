// import create browser client
import { createBrowserClient } from "@supabase/ssr";

export const supabaseBrowswerClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

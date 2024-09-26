import { supabaseBrowswerClient } from "./supabase-client";
import { Provider } from "@supabase/supabase-js";

// Function to handle social authentication
export async function socialAuth(provider: Provider) {
  await supabaseBrowswerClient.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  });
}

// Function to logout
export async function handleLogout() {
  await supabaseBrowswerClient.auth.signOut();
}

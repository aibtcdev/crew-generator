import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Function to get the base URL based on the environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_SITE_URL!; // Ensure this is set in your production environment
  }
  return "http://localhost:3000"; // Default for local development
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const origin = getBaseUrl(); // Use the dynamic base URL

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore
              .getAll()
              .map(({ name, value }) => ({ name, value }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, ...options }) => {
              cookieStore.set(name, value, options as CookieOptions);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${origin}/auth-error`);
    }

    // Fetch user information
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user information:", userError);
      return NextResponse.redirect(`${origin}/auth-error`);
    }

    // Fetch username from profiles table
    // const { data: profileData, error: profileError } = await supabase
    //   .from("profiles")
    //   .select("username")
    //   .eq("id", user.id)
    //   .single();

    // if (profileError || !profileData) {
    //   console.error("Error fetching profile information:", profileError);
    //   return NextResponse.redirect(`${origin}/auth-error`);
    // }

    // Construct user-specific dashboard URL using username
    const userDashboardUrl = `${origin}/dashboard/`;

    // Successful authentication
    return NextResponse.redirect(userDashboardUrl);
  }

  // If no code is present, redirect to home page or login page
  return NextResponse.redirect(`${origin}/login`);
}

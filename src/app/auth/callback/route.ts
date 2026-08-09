import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { findOrLinkAuthenticatedUser } from "@/services/user-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", url.origin),
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", url.origin),
    );
  }

  try {
    const crmUser = await findOrLinkAuthenticatedUser(
      data.user.id,
      data.user.email,
    );

    if (!crmUser) {
      await supabase.auth.signOut();

      return NextResponse.redirect(
        new URL("/login?error=not_authorized", url.origin),
      );
    }
  } catch (linkError) {
    console.error("Failed to link Google-authenticated user", linkError);

    await supabase.auth.signOut();

    return NextResponse.redirect(
      new URL("/login?error=link_failed", url.origin),
    );
  }

  return NextResponse.redirect(new URL("/dashboard", url.origin));
}

"use server";

import { createClient } from "@/lib/supabase/server";

export type LogoutActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function logout(): Promise<LogoutActionResult> {
  const supabase = await createClient();

  const { error } =
    await supabase.auth.signOut();

  if (error) {
    console.error(
      "Supabase logout failed",
      error,
    );

    return {
      success: false,
      message:
        "Unable to log out right now. Please try again.",
    };
  }

  return {
    success: true,
  };
}
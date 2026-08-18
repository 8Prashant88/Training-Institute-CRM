"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="size-4 shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

type GoogleSignInButtonProps = {
  disabled?: boolean;
};

export default function GoogleSignInButton({
  disabled = false,
}: GoogleSignInButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (isRedirecting) {
      return;
    }

    setError("");
    setIsRedirecting(true);

    const supabase = createClient();

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError("Unable to start Google sign-in. Please try again.");
      setIsRedirecting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isRedirecting}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon />
        {isRedirecting ? "Redirecting…" : "Continue with Google"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

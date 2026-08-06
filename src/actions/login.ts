"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/validations/login-schema";
import {
  findOrLinkAuthenticatedUser,
} from "@/services/user-service";

type LoginFieldErrors = {
  email?: string;
  password?: string;
};


export type LoginActionResult =
  | {
      success: true;
      message: string;
      data: {
        userId: string;
        fullName: string;
        email: string;
        role: "ADMIN" | "COUNSELOR";
      };
    }
  | {
      success: false;
      message: string;
      fieldErrors: LoginFieldErrors;
    };

export async function login(
  input: unknown,
): Promise<LoginActionResult> {
  const validationResult =
    loginSchema.safeParse(input);

  if (!validationResult.success) {
    const errors =
      validationResult.error.flatten()
        .fieldErrors;

    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      fieldErrors: {
        email: errors.email?.[0],
        password: errors.password?.[0],
      },
    };
  }

  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: validationResult.data.email,
      password:
        validationResult.data.password,
    });

  if (error || !data.user) {
    return {
      success: false,
      message:
        "The email or password is incorrect.",
      fieldErrors: {},
    };
  }

 const authenticatedEmail =
  data.user.email;

if (!authenticatedEmail) {
  await supabase.auth.signOut();

  return {
    success: false,
    message:
      "This account cannot access the CRM.",
    fieldErrors: {},
  };
}

try {
  const crmUser =
    await findOrLinkAuthenticatedUser(
      data.user.id,
      authenticatedEmail,
    );

  if (!crmUser) {
    await supabase.auth.signOut();

    return {
      success: false,
      message:
        "This account is not authorized to access the CRM.",
      fieldErrors: {},
    };
  }

  return {
    success: true,
    message: "Login successful.",
    data: {
      userId: crmUser.id,
      fullName: crmUser.fullName,
      email: crmUser.email,
      role: crmUser.role,
    },
  };
} catch (profileError) {
  console.error(
    "Failed to connect authenticated user to CRM profile",
    profileError,
  );

  await supabase.auth.signOut();

  return {
    success: false,
    message:
      "Unable to complete login right now.",
    fieldErrors: {},
  };
}
}
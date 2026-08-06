"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { login } from "@/actions/login";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { loginSchema } from "@/validations/login-schema";

type LoginFieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState<LoginFieldErrors>({});

  const [generalError, setGeneralError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const submissionLockRef = useRef(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submissionLockRef.current) {
      return;
    }

    setFieldErrors({});
    setGeneralError("");

    const validationResult =
      loginSchema.safeParse({
        email,
        password,
      });

    if (!validationResult.success) {
      const errors =
        validationResult.error.flatten()
          .fieldErrors;

      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      });

      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await login(
        validationResult.data,
      );

      if (!result.success) {
        setFieldErrors(result.fieldErrors);
        setGeneralError(result.message);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(
        "Login submission failed",
        error,
      );

      setGeneralError(
        "Unable to sign in right now. Please try again.",
      );
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 grid gap-4"
    >
      {generalError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {generalError}
        </div>
      )}

      <Field
        id="login-email"
        label="Email address"
        required
        error={fieldErrors.email}
      >
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="counselor@example.com"
          value={email}
          invalid={Boolean(
            fieldErrors.email,
          )}
          disabled={isSubmitting}
          onChange={(event) => {
            setEmail(event.target.value);

            setFieldErrors((current) => ({
              ...current,
              email: undefined,
            }));

            setGeneralError("");
          }}
        />
      </Field>

      <Field
        id="login-password"
        label="Password"
        required
        error={fieldErrors.password}
      >
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          invalid={Boolean(
            fieldErrors.password,
          )}
          disabled={isSubmitting}
          onChange={(event) => {
            setPassword(event.target.value);

            setFieldErrors((current) => ({
              ...current,
              password: undefined,
            }));

            setGeneralError("");
          }}
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        isLoading={isSubmitting}
        className="mt-2 w-full"
      >
        {isSubmitting
          ? "Signing in..."
          : "Sign in"}
      </Button>
    </form>
  );
}
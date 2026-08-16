import "server-only";

import { Resend } from "resend";

const EMAIL_TIMEOUT_MS = 8_000;

type EmailConfig = {
  apiKey: string;
  from: string;
  notificationEmail: string;
};

export type PublicInquiryEmailInput = {
  leadId: string;

  fullName: string;
  email: string;
  phone: string;

  courseTitle: string;

  message?: string | null;
};

export type EmailNotificationResult =
  | {
      success: true;
      emailId: string;
    }
  | {
      success: false;

      code:
        | "NOT_CONFIGURED"
        | "TIMEOUT"
        | "PROVIDER_ERROR";

      message: string;
    };

class EmailTimeoutError extends Error {
  constructor() {
    super(
      "Email provider did not respond within the allowed time.",
    );

    this.name = "EmailTimeoutError";
  }
}

function getEmailConfig():
  | EmailConfig
  | null {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  const from =
    process.env.CRM_EMAIL_FROM?.trim();

  const notificationEmail =
    process.env
      .CRM_NOTIFICATION_EMAIL?.trim();

  const missing: string[] = [];

  if (!apiKey) {
    missing.push("RESEND_API_KEY");
  }

  if (!from) {
    missing.push("CRM_EMAIL_FROM");
  }

  if (!notificationEmail) {
    missing.push(
      "CRM_NOTIFICATION_EMAIL",
    );
  }

  if (
    !apiKey ||
    !from ||
    !notificationEmail
  ) {
    console.error(
      "Email notification configuration is incomplete.",
      {
        missing,
      },
    );

    return null;
  }

  return {
    apiKey,
    from,
    notificationEmail,
  };
}
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return new Promise<T>(
    (resolve, reject) => {
      const timeout =
        setTimeout(() => {
          reject(
            new EmailTimeoutError(),
          );
        }, timeoutMs);

      promise.then(
        (value) => {
          clearTimeout(timeout);
          resolve(value);
        },

        (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      );
    },
  );
}

function createInquiryEmailText(
  input: PublicInquiryEmailInput,
): string {
  return [
    "A new inquiry was submitted through the CRM website.",
    "",
    `Lead ID: ${input.leadId}`,
    `Name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Course: ${input.courseTitle}`,
    "",
    "Message:",
    input.message?.trim() ||
      "No message provided.",
  ].join("\n");
}

export async function sendPublicInquiryNotification(
  input: PublicInquiryEmailInput,
): Promise<EmailNotificationResult> {
  const config = getEmailConfig();

  if (!config) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      message:
        "Email notifications are not configured.",
    };
  }

  try {
    const resend = new Resend(
      config.apiKey,
    );

    const request =
      resend.emails.send(
        {
          from: config.from,

          to: [
            config.notificationEmail,
          ],

          replyTo: input.email,

          subject:
            `New CRM inquiry — ${input.fullName}`,

          text:
            createInquiryEmailText(
              input,
            ),
        },

        {
          idempotencyKey:
            `public-inquiry-v1/${input.leadId}`,
        },
      );

    const {
      data,
      error,
    } = await withTimeout(
      request,
      EMAIL_TIMEOUT_MS,
    );

    if (error) {
      console.error(
        "Resend rejected the email notification.",
        {
          name: error.name,
          message: error.message,
        },
      );

      return {
        success: false,
        code: "PROVIDER_ERROR",
        message:
          "The email provider rejected the notification.",
      };
    }

    if (!data?.id) {
      console.error(
        "Resend returned no email ID.",
      );

      return {
        success: false,
        code: "PROVIDER_ERROR",
        message:
          "The email provider returned an unexpected response.",
      };
    }

    return {
      success: true,
      emailId: data.id,
    };
  } catch (error) {
    if (
      error instanceof
      EmailTimeoutError
    ) {
      console.error(
        "Email notification timed out.",
      );

      return {
        success: false,
        code: "TIMEOUT",
        message:
          "The email provider did not respond in time.",
      };
    }

    console.error(
      "Unexpected email notification failure.",
      {
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
    );

    return {
      success: false,
      code: "PROVIDER_ERROR",
      message:
        "The email notification could not be sent.",
    };
  }
}
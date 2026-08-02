import * as z from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const leadFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, {
      error: "Full name must contain at least 2 characters.",
    })
    .max(100, {
      error: "Full name must not exceed 100 characters.",
    }),

  email: z
    .string()
    .trim()
    .min(1, {
      error: "Email address is required.",
    })
    .pipe(
      z.email({
        error: "Enter a valid email address.",
      }),
    ),

  phone: z
    .string()
    .trim()
    .min(1, {
      error: "Phone number is required.",
    })
    .refine(isValidPhoneNumber, {
      error: "Enter a valid international phone number.",
    }),

  interestedCourse: z
    .string()
    .trim()
    .min(2, {
      error: "Course interest must contain at least 2 characters.",
    })
    .max(120, {
      error: "Course interest must not exceed 120 characters.",
    }),
});

export const publicInquirySchema =
  leadFormSchema.extend({
    message: z
      .string()
      .trim()
      .min(10, {
        error:
          "Message must contain at least 10 characters.",
      })
      .max(1000, {
        error:
          "Message must not exceed 1000 characters.",
      }),
  });

export type LeadFormData = z.infer<
  typeof leadFormSchema
>;

export type PublicInquiryFormData = z.infer<
  typeof publicInquirySchema
>;
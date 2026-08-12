import * as z from "zod";

export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, {
      error: "The course title must contain at least 3 characters.",
    })
    .max(120, {
      error: "The course title cannot exceed 120 characters.",
    }),

  duration: z
    .string()
    .trim()
    .min(2, {
      error: "Enter a valid course duration.",
    })
    .max(40, {
      error: "The duration cannot exceed 40 characters.",
    }),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

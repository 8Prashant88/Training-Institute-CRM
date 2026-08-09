import * as z from "zod";

import { UserRole } from "@/generated/prisma/client";

export const createPersonSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { error: "Enter the person's full name." })
    .max(120, { error: "The name cannot exceed 120 characters." }),

  email: z
    .string()
    .trim()
    .min(1, { error: "Email is required." })
    .email({ error: "Enter a valid email address." })
    .max(254, { error: "Email is too long." }),

  role: z.enum(UserRole, { error: "Select a role." }),
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;

export const updatePersonRoleSchema = z.object({
  personId: z.uuid({ error: "The person ID is invalid." }),
  role: z.enum(UserRole, { error: "Select a role." }),
});

export type UpdatePersonRoleInput = z.infer<typeof updatePersonRoleSchema>;

export const setPersonActiveSchema = z.object({
  personId: z.uuid({ error: "The person ID is invalid." }),
});

export type SetPersonActiveInput = z.infer<typeof setPersonActiveSchema>;

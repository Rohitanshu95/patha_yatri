import { z } from "zod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;
const allowedRoles = ["admin", "manager", "receptionist"];

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  // .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().max(100).optional(),
    role: z.string().trim().max(100).optional(),
    hotel: z.string().regex(objectIdRegex, "Invalid hotel ID").optional(),
    status: z.enum(["all", "active", "inactive"]).optional(),
    sort: z.string().trim().max(50).optional(),
  }),
});

export const listUserOptionsSchema = z.object({
  query: z.object({
    role: z.string().trim().max(100).optional(),
    includeInactive: z.enum(["true", "false"]).optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Invalid email address"),
    password: passwordSchema,
    role: z.enum(allowedRoles),
    hotel: z.string().regex(objectIdRegex, "Invalid hotel ID").optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid user ID"),
  }),
  body: z
    .object({
      name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
      email: z.string().trim().email("Invalid email address").optional(),
      role: z.enum(allowedRoles).optional(),
      hotel: z.string().regex(objectIdRegex, "Invalid hotel ID").optional(),
      isActive: z.boolean().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field is required",
    }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid user ID"),
  }),
});

export const resetUserPasswordSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid user ID"),
  }),
  body: z.object({
    newPassword: passwordSchema,
  }),
});

import { z } from "zod";

export const registerSchema = z.object({
  // first_name: z.string().min(1, "First name is required"),
  // last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(8, "Student ID is required"),
  email: z.string().email("Invalid email address"),
  user_type: z
    .enum(["Student", "Teacher"])
    .refine((value) => ["Student", "Teacher"].includes(value), {
      message: "Role must be either Student or Teacher",
    }),
  userClass: z.string().optional(),
});

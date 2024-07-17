import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(8, "Student ID is required"),
  email: z.string().email("Invalid email address"),
});

// Example usage:
// const usageResult = loginSchema.safeParse(data: object);
// OR
// const { safeParse } = loginSchema;
// const result = safeParse(data);
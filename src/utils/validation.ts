import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createMemorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
});

export const echoSchema = z.object({
  memoryId: z.number().int("Memory ID must be an integer").positive(),
});

export const synthesisSchema = z.object({
  memoryIds: z
    .array(z.number().int().positive())
    .min(1, "At least one memory ID required"),
});

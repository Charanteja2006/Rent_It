import { z } from "zod";

export const createItemSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  imageUrl: z.string().url("A valid image URL is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required").max(10, "Maximum 10 tags"),
  rentPerDay: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be positive")
    .max(10000, "Price must be less than $10,000"),
  availableFrom: z.string().optional().nullable(),
  availableUntil: z.string().optional().nullable(),
});

export const updateItemSchema = createItemSchema.partial().extend({
  isAvailable: z.boolean().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

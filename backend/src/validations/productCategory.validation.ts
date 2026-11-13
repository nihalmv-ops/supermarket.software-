import { z } from 'zod';

export const createProductCategorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .min(2, 'Category name must be at least 2 characters long')
    .max(100, 'Category name cannot exceed 100 characters')
    .trim(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').trim().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateProductCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters long')
    .max(100, 'Category name cannot exceed 100 characters')
    .trim()
    .optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').trim().optional(),
  isActive: z.boolean().optional(),
});

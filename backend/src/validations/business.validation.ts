import { z } from 'zod';

export const createBusinessSchema = z.object({
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters long')
    .max(150, 'Business name cannot exceed 150 characters')
    .trim(),
  businessType: z
    .string()
    .min(2, 'Business type must be at least 2 characters long')
    .max(50, 'Business type cannot exceed 50 characters')
    .trim()
    .default('Retail'),
  email: z
    .string()
    .email('Please provide a valid business email address')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .trim(),
  address: z.string().max(250).trim().optional().default(''),
  city: z.string().max(100).trim().optional().default(''),
  state: z.string().max(100).trim().optional().default(''),
  country: z.string().max(100).trim().optional().default('India'),
  pincode: z.string().max(20).trim().optional().default(''),
  gstNumber: z
    .string()
    .max(30)
    .trim()
    .toUpperCase()
    .optional()
    .default(''),
  subscriptionPlan: z
    .enum(['Starter', 'Professional', 'Business'])
    .optional()
    .default('Starter'),
});

export const updateBusinessProfileSchema = z.object({
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters long')
    .max(150, 'Business name cannot exceed 150 characters')
    .trim()
    .optional(),
  businessType: z
    .string()
    .min(2, 'Business type must be at least 2 characters long')
    .max(50)
    .trim()
    .optional(),
  email: z
    .string()
    .email('Please provide a valid business email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z
    .string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20)
    .trim()
    .optional(),
  address: z.string().max(250).trim().optional(),
  city: z.string().max(100).trim().optional(),
  state: z.string().max(100).trim().optional(),
  country: z.string().max(100).trim().optional(),
  pincode: z.string().max(20).trim().optional(),
  gstNumber: z.string().max(30).trim().toUpperCase().optional(),
  logo: z.string().url('Logo must be a valid URL').optional().or(z.literal('')),
});

export const updateBusinessStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'inactive'], {
    errorMap: () => ({ message: 'Status must be active, suspended, or inactive' }),
  }),
});

export const switchBusinessSchema = z.object({
  businessId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid business identifier format'),
});

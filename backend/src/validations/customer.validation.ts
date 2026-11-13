import { z } from 'zod';

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const phoneRegex = /^\+?([0-9\s\-]{7,15})$/;

export const createCustomerSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Customer name must be at least 2 characters long')
    .max(150, 'Customer name cannot exceed 150 characters')
    .trim(),
  companyName: z
    .string()
    .max(150, 'Company name cannot exceed 150 characters')
    .trim()
    .optional()
    .default(''),
  customerType: z
    .enum(['individual', 'business', 'wholesale', 'retail'], {
      errorMap: () => ({
        message: 'Customer type must be individual, business, wholesale, or retail',
      }),
    })
    .default('business'),
  phone: z
    .string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(phoneRegex, 'Invalid phone number format')
    .trim(),
  alternatePhone: z
    .string()
    .max(20)
    .trim()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
      message: 'Invalid alternate phone number format',
    })
    .default(''),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Please provide a valid email address',
    })
    .default(''),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .refine((val) => !val || gstinRegex.test(val), {
      message: 'Invalid Indian GSTIN format (e.g., 27AAAAA0000A1Z5)',
    })
    .default(''),
  billingAddress: z.string().max(300).trim().optional().default(''),
  shippingAddress: z.string().max(300).trim().optional().default(''),
  city: z.string().max(100).trim().optional().default(''),
  state: z.string().max(100).trim().optional().default(''),
  pincode: z.string().max(20).trim().optional().default(''),
  country: z.string().max(100).trim().optional().default('India'),
  notes: z.string().max(1000).trim().optional().default(''),
  isActive: z.boolean().optional().default(true),
});

export const updateCustomerSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Customer name must be at least 2 characters long')
    .max(150)
    .trim()
    .optional(),
  companyName: z.string().max(150).trim().optional(),
  customerType: z
    .enum(['individual', 'business', 'wholesale', 'retail'])
    .optional(),
  phone: z
    .string()
    .min(7)
    .max(20)
    .regex(phoneRegex, 'Invalid phone number format')
    .trim()
    .optional(),
  alternatePhone: z
    .string()
    .max(20)
    .trim()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
      message: 'Invalid alternate phone number format',
    }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Please provide a valid email address',
    }),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .refine((val) => !val || gstinRegex.test(val), {
      message: 'Invalid Indian GSTIN format (e.g., 27AAAAA0000A1Z5)',
    }),
  billingAddress: z.string().max(300).trim().optional(),
  shippingAddress: z.string().max(300).trim().optional(),
  city: z.string().max(100).trim().optional(),
  state: z.string().max(100).trim().optional(),
  pincode: z.string().max(20).trim().optional(),
  country: z.string().max(100).trim().optional(),
  notes: z.string().max(1000).trim().optional(),
  isActive: z.boolean().optional(),
});

export const customerStatusSchema = z.object({
  isActive: z.boolean({
    required_error: 'isActive status boolean is required',
  }),
});

export const customerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  customerType: z
    .enum(['individual', 'business', 'wholesale', 'retail', 'all'])
    .optional()
    .default('all'),
  status: z.enum(['active', 'inactive', 'all']).optional().default('all'),
  sortBy: z
    .enum(['customerName', 'companyName', 'createdAt', 'updatedAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const importCustomerRowSchema = z.object({
  customerName: z
    .string({ required_error: 'Customer name is required' })
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  companyName: z.string().trim().optional().default(''),
  customerType: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((val) => {
      if (['individual', 'business', 'wholesale', 'retail'].includes(val || '')) {
        return val as 'individual' | 'business' | 'wholesale' | 'retail';
      }
      return 'business';
    }),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(7, 'Phone must be at least 7 digits'),
  alternatePhone: z.string().trim().optional().default(''),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Invalid email',
    })
    .default(''),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .refine((val) => !val || gstinRegex.test(val), {
      message: 'Invalid GSTIN',
    })
    .default(''),
  billingAddress: z.string().trim().optional().default(''),
  shippingAddress: z.string().trim().optional().default(''),
  city: z.string().trim().optional().default(''),
  state: z.string().trim().optional().default(''),
  pincode: z.string().trim().optional().default(''),
  country: z.string().trim().optional().default('India'),
  notes: z.string().trim().optional().default(''),
});

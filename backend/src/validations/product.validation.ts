import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid Category ID format',
  });

export const createProductSchema = z
  .object({
    itemType: z.enum(['product', 'service'], {
      required_error: 'Item type (product or service) is required',
    }),
    name: z
      .string({ required_error: 'Item name is required' })
      .min(2, 'Item name must be at least 2 characters long')
      .max(200, 'Item name cannot exceed 200 characters')
      .trim(),
    sku: z.string().max(100, 'SKU cannot exceed 100 characters').trim().optional(),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').trim().optional(),
    categoryId: objectIdValidator,
    hsnSacCode: z.string().max(20, 'HSN/SAC code cannot exceed 20 characters').trim().optional(),
    unit: z.string().min(1, 'Unit is required').max(50, 'Unit cannot exceed 50 characters').trim().default('pcs'),
    sellingPrice: z.coerce.number({ required_error: 'Selling price is required' }).min(0, 'Selling price cannot be negative'),
    purchasePrice: z.coerce.number().min(0, 'Purchase price cannot be negative').optional().default(0),
    gstRate: z.coerce
      .number({ required_error: 'GST rate is required' })
      .min(0, 'GST rate cannot be negative')
      .max(100, 'GST rate cannot exceed 100%')
      .default(18),
    taxType: z.enum(['inclusive', 'exclusive']).default('exclusive'),
    image: z.string().trim().optional(),
    isActive: z.boolean().optional().default(true),
    trackInventory: z.boolean().optional().default(false),
    stockQuantity: z.coerce.number().min(0, 'Stock quantity cannot be negative').optional().default(0),
    lowStockAlert: z.coerce.number().min(0, 'Low stock threshold cannot be negative').optional().default(5),
  })
  .refine(
    (data) => {
      // Services must not have inventory tracking enabled
      if (data.itemType === 'service' && data.trackInventory) {
        return false;
      }
      return true;
    },
    {
      message: 'Services cannot have inventory tracking enabled',
      path: ['trackInventory'],
    }
  );

export const updateProductSchema = z
  .object({
    itemType: z.enum(['product', 'service']).optional(),
    name: z
      .string()
      .min(2, 'Item name must be at least 2 characters long')
      .max(200, 'Item name cannot exceed 200 characters')
      .trim()
      .optional(),
    sku: z.string().max(100, 'SKU cannot exceed 100 characters').trim().optional(),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').trim().optional(),
    categoryId: objectIdValidator,
    hsnSacCode: z.string().max(20, 'HSN/SAC code cannot exceed 20 characters').trim().optional(),
    unit: z.string().min(1).max(50).trim().optional(),
    sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative').optional(),
    purchasePrice: z.coerce.number().min(0, 'Purchase price cannot be negative').optional(),
    gstRate: z.coerce.number().min(0).max(100).optional(),
    taxType: z.enum(['inclusive', 'exclusive']).optional(),
    image: z.string().trim().optional(),
    isActive: z.boolean().optional(),
    trackInventory: z.boolean().optional(),
    lowStockAlert: z.coerce.number().min(0, 'Low stock threshold cannot be negative').optional(),
  })
  .refine(
    (data) => {
      if (data.itemType === 'service' && data.trackInventory) {
        return false;
      }
      return true;
    },
    {
      message: 'Services cannot have inventory tracking enabled',
      path: ['trackInventory'],
    }
  );

export const productStatusSchema = z.object({
  isActive: z.boolean({
    required_error: 'isActive status boolean is required',
  }),
});

export const adjustStockSchema = z.object({
  adjustmentType: z.enum(['add', 'subtract', 'set'], {
    required_error: 'adjustmentType must be add, subtract, or set',
  }),
  quantity: z.coerce.number().positive('Quantity adjustment must be a positive number'),
  reason: z.string().min(3, 'Adjustment reason must be at least 3 characters long').max(300).trim(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  itemType: z.enum(['product', 'service', 'all']).optional().default('all'),
  categoryId: z.string().trim().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional().default('all'),
  lowStockOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  sortBy: z
    .enum(['name', 'sellingPrice', 'stockQuantity', 'createdAt', 'updatedAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const importProductRowSchema = z.object({
  name: z
    .string({ required_error: 'Product/Service name is required' })
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  itemType: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((val) => {
      if (val === 'service') return 'service';
      return 'product';
    }),
  sku: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  categoryName: z.string().trim().optional().default(''),
  hsnSacCode: z.string().trim().optional().default(''),
  unit: z.string().trim().optional().default('pcs'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be >= 0').default(0),
  purchasePrice: z.coerce.number().min(0, 'Purchase price must be >= 0').optional().default(0),
  gstRate: z.coerce.number().min(0).max(100).optional().default(18),
  taxType: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((val) => {
      if (val === 'inclusive') return 'inclusive';
      return 'exclusive';
    }),
  trackInventory: z
    .any()
    .optional()
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      const str = String(val).toLowerCase().trim();
      return str === 'true' || str === 'yes' || str === '1';
    }),
  stockQuantity: z.coerce.number().min(0).optional().default(0),
  lowStockAlert: z.coerce.number().min(0).optional().default(5),
});

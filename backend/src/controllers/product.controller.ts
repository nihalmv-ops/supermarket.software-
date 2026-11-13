import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/product.model.js';
import { ProductCategory } from '../models/productCategory.model.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createProductSchema,
  updateProductSchema,
  productStatusSchema,
  adjustStockSchema,
  productQuerySchema,
  importProductRowSchema,
} from '../validations/product.validation.js';

export class ProductController {
  /**
   * Create a new product or service
   * POST /api/products
   */
  static create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const validatedData = createProductSchema.parse(req.body);

      // Validate category if provided
      if (validatedData.categoryId) {
        const cat = await ProductCategory.findOne({
          _id: validatedData.categoryId,
          businessId: req.business._id,
        });
        if (!cat) {
          throw ApiError.badRequest('Referenced product category does not exist in this business.');
        }
      }

      // Check unique SKU within business if provided
      if (validatedData.sku && validatedData.sku.trim().length > 0) {
        const existingSku = await Product.findOne({
          businessId: req.business._id,
          sku: validatedData.sku.trim(),
        });
        if (existingSku) {
          throw ApiError.badRequest(
            `An item with SKU / code '${validatedData.sku}' already exists in your business.`
          );
        }
      }

      const product = await Product.create({
        ...validatedData,
        sku: validatedData.sku ? validatedData.sku.trim() : '',
        businessId: req.business._id,
      });

      const populated = await Product.findById(product._id).populate('categoryId', 'name');

      res.status(201).json({
        success: true,
        message: `${validatedData.itemType === 'service' ? 'Service' : 'Product'} created successfully`,
        data: populated,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all products & services with pagination, search & filters
   * GET /api/products
   */
  static getAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const query = productQuerySchema.parse(req.query);
      const businessId = req.business._id;

      const filter: Record<string, unknown> = { businessId };

      // Search across name, SKU, and HSN/SAC
      if (query.search && query.search.length > 0) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [{ name: regex }, { sku: regex }, { hsnSacCode: regex }];
      }

      // Filter by itemType
      if (query.itemType && query.itemType !== 'all') {
        filter.itemType = query.itemType;
      }

      // Filter by categoryId
      if (query.categoryId && query.categoryId.length > 0) {
        filter.categoryId = query.categoryId;
      }

      // Filter by active status
      if (query.status === 'active') {
        filter.isActive = true;
      } else if (query.status === 'inactive') {
        filter.isActive = false;
      }

      // Filter by low stock
      if (query.lowStockOnly) {
        filter.trackInventory = true;
        filter.$expr = { $lte: ['$stockQuantity', '$lowStockAlert'] };
      }

      // Pagination
      const page = query.page;
      const limit = query.limit;
      const skip = (page - 1) * limit;

      // Sort
      const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
      const sortOptions: Record<string, 1 | -1> = {
        [query.sortBy]: sortDirection,
      };

      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .populate('categoryId', 'name')
          .lean(),
        Product.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get single product/service by ID
   * GET /api/products/:id
   */
  static getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const { id } = req.params;

      const product = await Product.findOne({
        _id: id,
        businessId: req.business._id,
      }).populate('categoryId', 'name description');

      if (!product) {
        throw ApiError.notFound('Product or service not found.');
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update product or service
   * PUT /api/products/:id
   */
  static update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);

      const product = await Product.findOne({
        _id: id,
        businessId: req.business._id,
      });

      if (!product) {
        throw ApiError.notFound('Product or service not found.');
      }

      // Check category existence if category is changing
      if (
        validatedData.categoryId !== undefined &&
        validatedData.categoryId !== null &&
        String(validatedData.categoryId) !== String(product.categoryId)
      ) {
        const cat = await ProductCategory.findOne({
          _id: validatedData.categoryId,
          businessId: req.business._id,
        });
        if (!cat) {
          throw ApiError.badRequest('Referenced product category does not exist in this business.');
        }
      }

      // Check SKU collision if SKU is changing
      if (
        validatedData.sku !== undefined &&
        validatedData.sku.trim() !== (product.sku || '')
      ) {
        const skuTrimmed = validatedData.sku.trim();
        if (skuTrimmed.length > 0) {
          const existingSku = await Product.findOne({
            businessId: req.business._id,
            sku: skuTrimmed,
            _id: { $ne: id },
          });

          if (existingSku) {
            throw ApiError.badRequest(
              `An item with SKU / code '${skuTrimmed}' already exists in your business.`
            );
          }
        }
      }

      // Assign updates (note: stockQuantity is not updated directly here to preserve audit safety)
      Object.assign(product, {
        ...validatedData,
        sku: validatedData.sku !== undefined ? validatedData.sku.trim() : product.sku,
      });

      await product.save();

      const populated = await Product.findById(product._id).populate('categoryId', 'name');

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: populated,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete product or service
   * DELETE /api/products/:id
   */
  static delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const { id } = req.params;

      const product = await Product.findOne({
        _id: id,
        businessId: req.business._id,
      });

      if (!product) {
        throw ApiError.notFound('Product or service not found.');
      }

      await Product.deleteOne({ _id: id, businessId: req.business._id });

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Toggle active/inactive status
   * PATCH /api/products/:id/status
   */
  static updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const { id } = req.params;
      const { isActive } = productStatusSchema.parse(req.body);

      const product = await Product.findOneAndUpdate(
        { _id: id, businessId: req.business._id },
        { isActive },
        { new: true }
      ).populate('categoryId', 'name');

      if (!product) {
        throw ApiError.notFound('Product or service not found.');
      }

      res.status(200).json({
        success: true,
        message: `Item status updated to ${isActive ? 'Active' : 'Inactive'}`,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Safe stock adjustment mechanism
   * POST /api/products/:id/adjust-stock
   */
  static adjustStock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const { id } = req.params;
      const { adjustmentType, quantity, reason } = adjustStockSchema.parse(req.body);

      const product = await Product.findOne({
        _id: id,
        businessId: req.business._id,
      });

      if (!product) {
        throw ApiError.notFound('Product not found.');
      }

      if (product.itemType === 'service') {
        throw ApiError.badRequest('Stock adjustment is not applicable for service items.');
      }

      if (!product.trackInventory) {
        throw ApiError.badRequest(
          'Inventory tracking is not enabled for this product. Enable inventory tracking before adjusting stock.'
        );
      }

      let newQuantity = product.stockQuantity;

      if (adjustmentType === 'add') {
        newQuantity += quantity;
      } else if (adjustmentType === 'subtract') {
        if (product.stockQuantity < quantity) {
          throw ApiError.badRequest(
            `Insufficient stock. Current stock is ${product.stockQuantity}, cannot subtract ${quantity}.`
          );
        }
        newQuantity -= quantity;
      } else if (adjustmentType === 'set') {
        newQuantity = quantity;
      }

      product.stockQuantity = newQuantity;
      await product.save();

      const populated = await Product.findById(product._id).populate('categoryId', 'name');

      res.status(200).json({
        success: true,
        message: `Stock successfully adjusted (${adjustmentType}: ${quantity}, reason: "${reason}"). New stock: ${newQuantity}`,
        data: {
          product: populated,
          adjustment: {
            adjustmentType,
            quantity,
            reason,
            previousStock: product.stockQuantity,
            newStock: newQuantity,
            timestamp: new Date(),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get product and service summary metrics
   * GET /api/products/metrics/summary
   */
  static getMetrics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const businessId = req.business._id;

      const [totalProducts, totalServices, activeItems, lowStockItems] =
        await Promise.all([
          Product.countDocuments({ businessId, itemType: 'product' }),
          Product.countDocuments({ businessId, itemType: 'service' }),
          Product.countDocuments({ businessId, isActive: true }),
          Product.countDocuments({
            businessId,
            itemType: 'product',
            trackInventory: true,
            $expr: { $lte: ['$stockQuantity', '$lowStockAlert'] },
          }),
        ]);

      res.status(200).json({
        success: true,
        data: {
          totalProducts,
          totalServices,
          activeItems,
          lowStockItems,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export products & services to CSV
   * GET /api/products/export/csv
   */
  static exportCsv = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const items = await Product.find({ businessId: req.business._id })
        .sort({ name: 1 })
        .populate('categoryId', 'name')
        .lean();

      const headers = [
        'Name',
        'Item Type',
        'SKU',
        'Category',
        'Description',
        'HSN/SAC Code',
        'Unit',
        'Selling Price',
        'Purchase Price',
        'GST Rate',
        'Tax Type',
        'Track Inventory',
        'Stock Quantity',
        'Low Stock Alert',
        'Status',
        'Created At',
      ];

      const csvRows: string[] = [headers.join(',')];

      for (const item of items) {
        const cat = item.categoryId as unknown as { name?: string } | null;
        const categoryName = cat?.name || '';

        const row = [
          `"${(item.name || '').replace(/"/g, '""')}"`,
          `"${item.itemType || 'product'}"`,
          `"${(item.sku || '').replace(/"/g, '""')}"`,
          `"${categoryName.replace(/"/g, '""')}"`,
          `"${(item.description || '').replace(/"/g, '""')}"`,
          `"${(item.hsnSacCode || '').replace(/"/g, '""')}"`,
          `"${item.unit || 'pcs'}"`,
          item.sellingPrice ?? 0,
          item.purchasePrice ?? 0,
          item.gstRate ?? 18,
          `"${item.taxType || 'exclusive'}"`,
          item.trackInventory ? 'TRUE' : 'FALSE',
          item.trackInventory ? item.stockQuantity : 0,
          item.trackInventory ? item.lowStockAlert : 0,
          item.isActive ? 'Active' : 'Inactive',
          `"${new Date(item.createdAt).toISOString()}"`,
        ];

        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\r\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="products-export-${Date.now()}.csv"`
      );
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Download CSV import template
   * GET /api/products/template/csv
   */
  static downloadTemplateCsv = (
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    const headers = [
      'Name',
      'Item Type',
      'SKU',
      'Category Name',
      'Description',
      'HSN/SAC Code',
      'Unit',
      'Selling Price',
      'Purchase Price',
      'GST Rate',
      'Tax Type',
      'Track Inventory',
      'Stock Quantity',
      'Low Stock Alert',
    ];

    const sampleRows = [
      [
        '"Basmati Rice 5kg"',
        '"product"',
        '"RICE-BAS-001"',
        '"Grocery"',
        '"Premium aged royal basmati rice"',
        '"1006"',
        '"bag"',
        '450',
        '380',
        '5',
        '"exclusive"',
        'TRUE',
        '50',
        '10',
      ],
      [
        '"Web Development Consulting"',
        '"service"',
        '"SRV-WEB-001"',
        '"Services"',
        '"Hourly technical architecture & design consultancy"',
        '"998314"',
        '"hour"',
        '2500',
        '0',
        '18',
        '"exclusive"',
        'FALSE',
        '0',
        '0',
      ],
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map((r) => r.join(',')),
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="products-import-template.csv"'
    );
    res.status(200).send(csvContent);
  };

  /**
   * Bulk import products & services from parsed CSV data
   * POST /api/products/import/csv
   */
  static importCsv = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const rows = req.body?.rows;
      if (!Array.isArray(rows) || rows.length === 0) {
        throw ApiError.badRequest('No data rows provided for import.');
      }

      if (rows.length > 500) {
        throw ApiError.badRequest('Import batch limit exceeded (Maximum 500 records per upload).');
      }

      const businessId = req.business._id;

      // Fetch existing SKUs in this business to detect duplicates
      const existingSkus = await Product.find({
        businessId,
        sku: { $exists: true, $ne: '' },
      }).distinct('sku');

      const skuSet = new Set(
        existingSkus.map((s) => String(s).toUpperCase().trim())
      );
      const seenInBatchSkus = new Set<string>();

      // Load existing categories for name-based lookup
      const existingCategories = await ProductCategory.find({ businessId });
      const categoryMap = new Map<string, string>();
      existingCategories.forEach((c) =>
        categoryMap.set(c.name.toLowerCase().trim(), String(c._id))
      );

      const validRecords: Array<Record<string, unknown>> = [];
      const rowErrors: Array<{ row: number; error: string; data: unknown }> = [];

      for (let i = 0; i < rows.length; i++) {
        const rawRow = rows[i];
        const rowNumber = i + 1;

        try {
          const normalized = {
            name: rawRow.Name || rawRow.name || rawRow['Product Name'] || rawRow['Item Name'],
            itemType: rawRow['Item Type'] || rawRow.itemType || rawRow.Type || rawRow.type || 'product',
            sku: rawRow.SKU || rawRow.sku || rawRow['Item Code'] || rawRow.itemCode || '',
            description: rawRow.Description || rawRow.description || '',
            categoryName: rawRow['Category Name'] || rawRow.categoryName || rawRow.Category || rawRow.category || '',
            hsnSacCode: rawRow['HSN/SAC Code'] || rawRow.hsnSacCode || rawRow.HSN || rawRow.hsn || '',
            unit: rawRow.Unit || rawRow.unit || 'pcs',
            sellingPrice: rawRow['Selling Price'] ?? rawRow.sellingPrice ?? rawRow.Price ?? rawRow.price ?? 0,
            purchasePrice: rawRow['Purchase Price'] ?? rawRow.purchasePrice ?? 0,
            gstRate: rawRow['GST Rate'] ?? rawRow.gstRate ?? rawRow.GST ?? rawRow.gst ?? 18,
            taxType: rawRow['Tax Type'] || rawRow.taxType || 'exclusive',
            trackInventory: rawRow['Track Inventory'] ?? rawRow.trackInventory ?? false,
            stockQuantity: rawRow['Stock Quantity'] ?? rawRow.stockQuantity ?? 0,
            lowStockAlert: rawRow['Low Stock Alert'] ?? rawRow.lowStockAlert ?? 5,
          };

          const validated = importProductRowSchema.parse(normalized);

          // If SKU is provided, verify uniqueness against DB and batch
          if (validated.sku && validated.sku.trim().length > 0) {
            const skuUpper = validated.sku.toUpperCase().trim();

            if (skuSet.has(skuUpper)) {
              rowErrors.push({
                row: rowNumber,
                error: `SKU '${validated.sku}' already exists in your business.`,
                data: rawRow,
              });
              continue;
            }

            if (seenInBatchSkus.has(skuUpper)) {
              rowErrors.push({
                row: rowNumber,
                error: `Duplicate SKU '${validated.sku}' in uploaded CSV batch.`,
                data: rawRow,
              });
              continue;
            }

            seenInBatchSkus.add(skuUpper);
          }

          // Resolve or auto-create category if categoryName is provided
          let resolvedCategoryId: string | null = null;
          if (validated.categoryName && validated.categoryName.trim().length > 0) {
            const catKey = validated.categoryName.toLowerCase().trim();
            if (categoryMap.has(catKey)) {
              resolvedCategoryId = categoryMap.get(catKey)!;
            } else {
              // Create category on the fly
              const newCat = await ProductCategory.create({
                businessId,
                name: validated.categoryName.trim(),
                description: 'Imported via CSV product upload',
              });
              resolvedCategoryId = String(newCat._id);
              categoryMap.set(catKey, resolvedCategoryId);
            }
          }

          // Services cannot track inventory
          const isService = validated.itemType === 'service';
          const shouldTrack = isService ? false : Boolean(validated.trackInventory);

          validRecords.push({
            businessId,
            itemType: validated.itemType,
            name: validated.name,
            sku: validated.sku ? validated.sku.trim() : '',
            description: validated.description,
            categoryId: resolvedCategoryId,
            hsnSacCode: validated.hsnSacCode,
            unit: validated.unit,
            sellingPrice: validated.sellingPrice,
            purchasePrice: validated.purchasePrice,
            gstRate: validated.gstRate,
            taxType: validated.taxType,
            isActive: true,
            trackInventory: shouldTrack,
            stockQuantity: shouldTrack ? validated.stockQuantity : 0,
            lowStockAlert: shouldTrack ? validated.lowStockAlert : 0,
          });
        } catch (rowErr: unknown) {
          const msg =
            rowErr instanceof Error ? rowErr.message : 'Invalid row values';
          rowErrors.push({
            row: rowNumber,
            error: msg,
            data: rawRow,
          });
        }
      }

      let insertedCount = 0;
      if (validRecords.length > 0) {
        const inserted = await Product.insertMany(validRecords);
        insertedCount = inserted.length;
      }

      res.status(200).json({
        success: true,
        message: `Import processed: ${insertedCount} item(s) imported, ${rowErrors.length} failed.`,
        data: {
          importedCount: insertedCount,
          failedCount: rowErrors.length,
          errors: rowErrors,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

import { Request, Response, NextFunction } from 'express';
import { ProductCategory } from '../models/productCategory.model.js';
import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createProductCategorySchema,
  updateProductCategorySchema,
} from '../validations/productCategory.validation.js';

export class ProductCategoryController {
  /**
   * Create a new product category
   * POST /api/product-categories
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

      const validatedData = createProductCategorySchema.parse(req.body);

      // Check if category name already exists for this business
      const existing = await ProductCategory.findOne({
        businessId: req.business._id,
        name: { $regex: new RegExp(`^${validatedData.name.trim()}$`, 'i') },
      });

      if (existing) {
        throw ApiError.badRequest(
          `A category with name '${validatedData.name}' already exists in your business.`
        );
      }

      const category = await ProductCategory.create({
        ...validatedData,
        businessId: req.business._id,
      });

      res.status(201).json({
        success: true,
        message: 'Product category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all product categories for the active business
   * GET /api/product-categories
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

      const status = req.query.status as string;
      const filter: Record<string, unknown> = {
        businessId: req.business._id,
      };

      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }

      const categories = await ProductCategory.find(filter)
        .sort({ name: 1 })
        .lean();

      // Aggregate product counts per category for the business
      const counts = await Product.aggregate([
        { $match: { businessId: req.business._id, categoryId: { $ne: null } } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      ]);

      const countMap = new Map<string, number>();
      counts.forEach((c) => countMap.set(String(c._id), c.count));

      const categoriesWithCount = categories.map((cat) => ({
        ...cat,
        productCount: countMap.get(String(cat._id)) || 0,
      }));

      res.status(200).json({
        success: true,
        data: categoriesWithCount,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a product category
   * PUT /api/product-categories/:id
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
      const validatedData = updateProductCategorySchema.parse(req.body);

      const category = await ProductCategory.findOne({
        _id: id,
        businessId: req.business._id,
      });

      if (!category) {
        throw ApiError.notFound('Product category not found.');
      }

      // Check name collision if name is being changed
      if (
        validatedData.name &&
        validatedData.name.toLowerCase() !== category.name.toLowerCase()
      ) {
        const existing = await ProductCategory.findOne({
          businessId: req.business._id,
          name: { $regex: new RegExp(`^${validatedData.name.trim()}$`, 'i') },
          _id: { $ne: id },
        });

        if (existing) {
          throw ApiError.badRequest(
            `A category with name '${validatedData.name}' already exists in your business.`
          );
        }
      }

      Object.assign(category, validatedData);
      await category.save();

      res.status(200).json({
        success: true,
        message: 'Product category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a product category safely
   * DELETE /api/product-categories/:id
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

      const category = await ProductCategory.findOne({
        _id: id,
        businessId: req.business._id,
      });

      if (!category) {
        throw ApiError.notFound('Product category not found.');
      }

      // Prevent deleting category if any product is currently assigned to it
      const productCount = await Product.countDocuments({
        businessId: req.business._id,
        categoryId: id,
      });

      if (productCount > 0) {
        throw ApiError.badRequest(
          `Cannot delete category '${category.name}' because ${productCount} item(s) are assigned to it. Please reassign or remove these items first.`
        );
      }

      await ProductCategory.deleteOne({ _id: id, businessId: req.business._id });

      res.status(200).json({
        success: true,
        message: 'Product category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

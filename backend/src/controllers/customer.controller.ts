import { Request, Response, NextFunction } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { Customer, ICustomerDocument } from '../models/customer.model.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerStatusSchema,
  customerQuerySchema,
  importCustomerRowSchema,
} from '../validations/customer.validation.js';

export class CustomerController {
  /**
   * Create a new Customer record scoped to active tenant
   * POST /api/customers
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

      const validatedData = createCustomerSchema.parse(req.body);

      // Verify duplicate phone within the same tenant
      const existingPhone = await Customer.findOne({
        businessId: req.business._id,
        phone: validatedData.phone,
      });

      if (existingPhone) {
        throw ApiError.badRequest(
          `A customer with phone number '${validatedData.phone}' already exists in your business.`
        );
      }

      // If email provided, verify duplicate email within tenant
      if (validatedData.email) {
        const existingEmail = await Customer.findOne({
          businessId: req.business._id,
          email: validatedData.email,
        });

        if (existingEmail) {
          throw ApiError.badRequest(
            `A customer with email '${validatedData.email}' already exists in your business.`
          );
        }
      }

      // If GSTIN provided, verify duplicate GSTIN within tenant
      if (validatedData.gstin) {
        const existingGstin = await Customer.findOne({
          businessId: req.business._id,
          gstin: validatedData.gstin,
        });

        if (existingGstin) {
          throw ApiError.badRequest(
            `A customer with GSTIN '${validatedData.gstin}' already exists in your business.`
          );
        }
      }

      const newCustomer = await Customer.create({
        ...validatedData,
        businessId: req.business._id,
      });

      res.status(201).json({
        success: true,
        message: 'Customer created successfully.',
        data: newCustomer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * List customers with pagination, search, sorting & filters
   * GET /api/customers
   */
  static list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const queryParams = customerQuerySchema.parse(req.query);
      const { page, limit, search, customerType, status, sortBy, sortOrder } = queryParams;
      const skip = (page - 1) * limit;

      const filter: FilterQuery<ICustomerDocument> = {
        businessId: req.business._id,
      };

      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { customerName: searchRegex },
          { companyName: searchRegex },
          { phone: searchRegex },
          { email: searchRegex },
          { gstin: searchRegex },
          { city: searchRegex },
        ];
      }

      if (customerType && customerType !== 'all') {
        filter.customerType = customerType;
      }

      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }

      const sortOptions: Record<string, 1 | -1> = {
        [sortBy]: sortOrder === 'asc' ? 1 : -1,
      };

      const [customers, total, totalActive, totalInactive] = await Promise.all([
        Customer.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
        Customer.countDocuments(filter),
        Customer.countDocuments({ businessId: req.business._id, isActive: true }),
        Customer.countDocuments({ businessId: req.business._id, isActive: false }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          customers,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
          stats: {
            totalAll: totalActive + totalInactive,
            active: totalActive,
            inactive: totalInactive,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get single customer by ID
   * GET /api/customers/:id
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

      const customerId = req.params.id as string;
      if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw ApiError.badRequest('Invalid customer identifier format.');
      }

      const customer = await Customer.findOne({
        _id: customerId,
        businessId: req.business._id,
      });

      if (!customer) {
        throw ApiError.notFound('Customer not found in this business.');
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update customer profile
   * PUT /api/customers/:id
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

      const customerId = req.params.id as string;
      if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw ApiError.badRequest('Invalid customer identifier format.');
      }

      const validatedData = updateCustomerSchema.parse(req.body);

      // Verify target customer exists in current tenant
      const existingCustomer = await Customer.findOne({
        _id: customerId,
        businessId: req.business._id,
      });

      if (!existingCustomer) {
        throw ApiError.notFound('Customer not found in this business.');
      }

      // Check phone collision with other customers in same business
      if (validatedData.phone && validatedData.phone !== existingCustomer.phone) {
        const phoneExists = await Customer.findOne({
          businessId: req.business._id,
          phone: validatedData.phone,
          _id: { $ne: customerId },
        });

        if (phoneExists) {
          throw ApiError.badRequest(
            `Another customer in this business already uses phone number '${validatedData.phone}'.`
          );
        }
      }

      // Check email collision with other customers in same business
      if (validatedData.email && validatedData.email !== existingCustomer.email) {
        const emailExists = await Customer.findOne({
          businessId: req.business._id,
          email: validatedData.email,
          _id: { $ne: customerId },
        });

        if (emailExists) {
          throw ApiError.badRequest(
            `Another customer in this business already uses email '${validatedData.email}'.`
          );
        }
      }

      // Check GSTIN collision with other customers in same business
      if (validatedData.gstin && validatedData.gstin !== existingCustomer.gstin) {
        const gstinExists = await Customer.findOne({
          businessId: req.business._id,
          gstin: validatedData.gstin,
          _id: { $ne: customerId },
        });

        if (gstinExists) {
          throw ApiError.badRequest(
            `Another customer in this business already uses GSTIN '${validatedData.gstin}'.`
          );
        }
      }

      const updatedCustomer = await Customer.findOneAndUpdate(
        { _id: customerId, businessId: req.business._id },
        { $set: validatedData },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully.',
        data: updatedCustomer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete customer
   * DELETE /api/customers/:id
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

      const customerId = req.params.id as string;
      if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw ApiError.badRequest('Invalid customer identifier format.');
      }

      const deleted = await Customer.findOneAndDelete({
        _id: customerId,
        businessId: req.business._id,
      });

      if (!deleted) {
        throw ApiError.notFound('Customer not found in this business.');
      }

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Toggle Customer Active/Inactive Status
   * PATCH /api/customers/:id/status
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

      const customerId = req.params.id as string;
      if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw ApiError.badRequest('Invalid customer identifier format.');
      }

      const { isActive } = customerStatusSchema.parse(req.body);

      const updatedCustomer = await Customer.findOneAndUpdate(
        { _id: customerId, businessId: req.business._id },
        { $set: { isActive } },
        { new: true }
      );

      if (!updatedCustomer) {
        throw ApiError.notFound('Customer not found in this business.');
      }

      res.status(200).json({
        success: true,
        message: `Customer status updated to ${isActive ? 'Active' : 'Inactive'}.`,
        data: updatedCustomer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Customer Statement / Ledger (Clean empty state until Invoicing is developed)
   * GET /api/customers/:id/statement
   */
  static getStatement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const customerId = req.params.id as string;
      if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw ApiError.badRequest('Invalid customer identifier format.');
      }

      const customer = await Customer.findOne({
        _id: customerId,
        businessId: req.business._id,
      });

      if (!customer) {
        throw ApiError.notFound('Customer not found in this business.');
      }

      // Invoices and quotations will populate here in Phase 6/7.
      // Accurate real-time derived ledger:
      const statement = {
        customer,
        totalInvoiced: 0,
        totalPaid: 0,
        outstandingBalance: 0,
        transactions: [],
        period: {
          startDate: req.query.startDate || null,
          endDate: req.query.endDate || null,
        },
      };

      res.status(200).json({
        success: true,
        data: statement,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Dashboard Key Metrics for Customers
   * GET /api/customers/metrics/summary
   */
  static getMetricsSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business tenant context found.');
      }

      const businessId = req.business._id;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [total, active, newThisMonth, recentlyAdded] = await Promise.all([
        Customer.countDocuments({ businessId }),
        Customer.countDocuments({ businessId, isActive: true }),
        Customer.countDocuments({ businessId, createdAt: { $gte: startOfMonth } }),
        Customer.find({ businessId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalCustomers: total,
          activeCustomers: active,
          newCustomersThisMonth: newThisMonth,
          customersWithOutstanding: 0, // Computed from real invoices once Invoice module is built
          recentlyAdded,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export all customer records to CSV
   * GET /api/customers/export/csv
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

      const customers = await Customer.find({ businessId: req.business._id })
        .sort({ customerName: 1 })
        .lean();

      const headers = [
        'Customer Name',
        'Company Name',
        'Customer Type',
        'Phone',
        'Alternate Phone',
        'Email',
        'GSTIN',
        'Billing Address',
        'Shipping Address',
        'City',
        'State',
        'Pincode',
        'Country',
        'Notes',
        'Status',
        'Created At',
      ];

      const csvRows: string[] = [headers.join(',')];

      for (const c of customers) {
        const escape = (val: unknown) => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        };

        const row = [
          escape(c.customerName),
          escape(c.companyName || ''),
          escape(c.customerType),
          escape(c.phone),
          escape(c.alternatePhone || ''),
          escape(c.email || ''),
          escape(c.gstin || ''),
          escape(c.billingAddress || ''),
          escape(c.shippingAddress || ''),
          escape(c.city || ''),
          escape(c.state || ''),
          escape(c.pincode || ''),
          escape(c.country || 'India'),
          escape(c.notes || ''),
          escape(c.isActive ? 'Active' : 'Inactive'),
          escape(c.createdAt ? new Date(c.createdAt).toISOString() : ''),
        ];

        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\r\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="customers-${req.business.businessSlug || 'export'}.csv"`
      );
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Download CSV Import Template
   * GET /api/customers/template/csv
   */
  static getCsvTemplate = async (
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const headers = [
      'Customer Name',
      'Company Name',
      'Customer Type',
      'Phone',
      'Alternate Phone',
      'Email',
      'GSTIN',
      'Billing Address',
      'Shipping Address',
      'City',
      'State',
      'Pincode',
      'Country',
      'Notes',
    ];

    const sampleRow = [
      '"Rajesh Sharma"',
      '"Sharma Traders Pvt Ltd"',
      '"business"',
      '"+91 9876543210"',
      '""',
      '"rajesh@sharmatraders.com"',
      '"27AAAAA0000A1Z5"',
      '"123 Market Street, Dadar"',
      '"123 Market Street, Dadar"',
      '"Mumbai"',
      '"Maharashtra"',
      '"400014"',
      '"India"',
      '"Preferred wholesale partner"',
    ];

    const csvContent = [headers.join(','), sampleRow.join(',')].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="customers-import-template.csv"'
    );
    res.status(200).send(csvContent);
  };

  /**
   * Bulk import customers from parsed CSV data
   * POST /api/customers/import/csv
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

      const validRecords: Array<Record<string, unknown>> = [];
      const rowErrors: Array<{ row: number; error: string; data: unknown }> = [];

      // Fetch existing phones, emails & GSTINs in this tenant to detect duplicates
      const [existingPhones, existingEmails, existingGstins] = await Promise.all([
        Customer.find({ businessId: req.business._id }).distinct('phone'),
        Customer.find({ businessId: req.business._id }).distinct('email'),
        Customer.find({ businessId: req.business._id }).distinct('gstin'),
      ]);

      const phoneSet = new Set(existingPhones.map((p) => String(p).trim()));
      const emailSet = new Set(
        existingEmails.filter(Boolean).map((e) => String(e).toLowerCase().trim())
      );
      const gstinSet = new Set(
        existingGstins.filter(Boolean).map((g) => String(g).toUpperCase().trim())
      );

      const seenInBatchPhones = new Set<string>();
      const seenInBatchEmails = new Set<string>();

      for (let i = 0; i < rows.length; i++) {
        const rawRow = rows[i];
        const rowNumber = i + 1;

        try {
          // Normalize possible CSV column variations
          const normalized = {
            customerName: rawRow['Customer Name'] || rawRow.customerName || rawRow.Name || rawRow.name,
            companyName: rawRow['Company Name'] || rawRow.companyName || rawRow.Company || rawRow.company || '',
            customerType: rawRow['Customer Type'] || rawRow.customerType || rawRow.Type || rawRow.type || 'business',
            phone: rawRow.Phone || rawRow.phone || rawRow['Phone Number'] || rawRow.mobile,
            alternatePhone: rawRow['Alternate Phone'] || rawRow.alternatePhone || '',
            email: rawRow.Email || rawRow.email || '',
            gstin: rawRow.GSTIN || rawRow.gstin || rawRow['GST Number'] || '',
            billingAddress: rawRow['Billing Address'] || rawRow.billingAddress || rawRow.Address || rawRow.address || '',
            shippingAddress: rawRow['Shipping Address'] || rawRow.shippingAddress || '',
            city: rawRow.City || rawRow.city || '',
            state: rawRow.State || rawRow.state || '',
            pincode: rawRow.Pincode || rawRow.pincode || rawRow['Zip Code'] || '',
            country: rawRow.Country || rawRow.country || 'India',
            notes: rawRow.Notes || rawRow.notes || '',
          };

          const validated = importCustomerRowSchema.parse(normalized);

          // Check duplicate in database
          if (phoneSet.has(validated.phone)) {
            rowErrors.push({
              row: rowNumber,
              error: `Phone number '${validated.phone}' already exists in your business.`,
              data: rawRow,
            });
            continue;
          }

          if (validated.email && emailSet.has(validated.email)) {
            rowErrors.push({
              row: rowNumber,
              error: `Email '${validated.email}' already exists in your business.`,
              data: rawRow,
            });
            continue;
          }

          if (validated.gstin && gstinSet.has(validated.gstin)) {
            rowErrors.push({
              row: rowNumber,
              error: `GSTIN '${validated.gstin}' already exists in your business.`,
              data: rawRow,
            });
            continue;
          }

          // Check duplicate within the uploaded batch itself
          if (seenInBatchPhones.has(validated.phone)) {
            rowErrors.push({
              row: rowNumber,
              error: `Duplicate phone '${validated.phone}' in uploaded CSV batch.`,
              data: rawRow,
            });
            continue;
          }

          if (validated.email && seenInBatchEmails.has(validated.email)) {
            rowErrors.push({
              row: rowNumber,
              error: `Duplicate email '${validated.email}' in uploaded CSV batch.`,
              data: rawRow,
            });
            continue;
          }

          seenInBatchPhones.add(validated.phone);
          if (validated.email) seenInBatchEmails.add(validated.email);

          validRecords.push({
            ...validated,
            businessId: req.business._id,
            isActive: true,
          });
        } catch (rowErr: unknown) {
          const errMsg =
            rowErr instanceof Error ? rowErr.message : 'Invalid row formatting';
          rowErrors.push({
            row: rowNumber,
            error: errMsg,
            data: rawRow,
          });
        }
      }

      let insertedCount = 0;
      if (validRecords.length > 0) {
        const result = await Customer.insertMany(validRecords, { ordered: false });
        insertedCount = result.length;
      }

      res.status(200).json({
        success: true,
        message: `Import processed. Successfully imported ${insertedCount} customer(s).`,
        data: {
          importedCount: insertedCount,
          failedCount: rowErrors.length,
          totalRows: rows.length,
          errors: rowErrors,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {}

import http from 'http';
import app from './dist/app.js';
import { connectDatabase, disconnectDatabase } from './dist/config/database.js';

// HTTP Request Helper
function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsedData = null;
        try {
          parsedData = JSON.parse(data);
        } catch {
          parsedData = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedData,
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      if (typeof postData === 'object') {
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

async function runProductTests() {
  console.log('🚀 [Test Suite] Starting Phase 6 Product & Service Management Test Suite...\n');

  const isConnected = await connectDatabase();
  if (!isConnected) {
    console.error('❌ Could not connect to database for tests');
    process.exit(1);
  }

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  const timestamp = Date.now();
  const results = [];

  const recordTest = (num, name, passed, details = '') => {
    results.push({ num, name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [Test ${num}] ${name} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // ---------------------------------------------------------
    // Setup: Register User A (Business A) and User B (Business B)
    // ---------------------------------------------------------
    const resRegA = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Merchant Alice',
        businessName: `Supermarket Alpha ${timestamp}`,
        email: `alice_${timestamp}@market.com`,
        phone: '+91 9123456781',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }
    );

    const tokenA = resRegA.body?.data?.accessToken;
    const businessAId = resRegA.body?.data?.business?._id;

    const resRegB = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Merchant Bob',
        businessName: `Hardware Beta ${timestamp}`,
        email: `bob_${timestamp}@hardware.com`,
        phone: '+91 9123456782',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }
    );

    const tokenB = resRegB.body?.data?.accessToken;
    const businessBId = resRegB.body?.data?.business?._id;

    if (!tokenA || !businessAId || !tokenB || !businessBId) {
      throw new Error('Failed to register test tenant users.');
    }

    // ---------------------------------------------------------
    // TEST 1: Category Creation
    // ---------------------------------------------------------
    const resCat1 = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/product-categories',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        name: `Grocery ${timestamp}`,
        description: 'Food and daily supermarket staples',
      }
    );

    const categoryAId = resCat1.body?.data?._id;
    recordTest(
      1,
      'Create product category successfully',
      resCat1.statusCode === 201 && !!categoryAId,
      `Category ID: ${categoryAId}`
    );

    // ---------------------------------------------------------
    // TEST 2: Duplicate Category Name in Same Business Rejected
    // ---------------------------------------------------------
    const resCatDup = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/product-categories',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        name: `Grocery ${timestamp}`,
      }
    );

    recordTest(
      2,
      'Duplicate category name rejected within same business (400)',
      resCatDup.statusCode === 400,
      `Status: ${resCatDup.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 3: Product Creation with Inventory Tracking
    // ---------------------------------------------------------
    const sharedSku = `SKU-PROD-${timestamp}`;
    const resProd1 = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/products',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        itemType: 'product',
        name: `Basmati Rice 5kg ${timestamp}`,
        sku: sharedSku,
        categoryId: categoryAId,
        hsnSacCode: '1006',
        unit: 'bag',
        sellingPrice: 450,
        purchasePrice: 380,
        gstRate: 5,
        taxType: 'exclusive',
        trackInventory: true,
        stockQuantity: 25,
        lowStockAlert: 5,
      }
    );

    const productAId = resProd1.body?.data?._id;
    recordTest(
      3,
      'Create physical product with inventory tracking enabled',
      resProd1.statusCode === 201 &&
        productAId &&
        resProd1.body?.data?.stockQuantity === 25,
      `Product ID: ${productAId}`
    );

    // ---------------------------------------------------------
    // TEST 4: Service Creation (Inventory tracking must be false)
    // ---------------------------------------------------------
    const resSrv1 = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/products',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        itemType: 'service',
        name: `Home Grocery Delivery ${timestamp}`,
        sku: `SRV-DEL-${timestamp}`,
        unit: 'service',
        sellingPrice: 50,
        gstRate: 18,
        taxType: 'inclusive',
        trackInventory: false,
      }
    );

    const serviceAId = resSrv1.body?.data?._id;
    recordTest(
      4,
      'Create billable service item without inventory tracking',
      resSrv1.statusCode === 201 &&
        serviceAId &&
        resSrv1.body?.data?.itemType === 'service' &&
        resSrv1.body?.data?.trackInventory === false,
      `Service ID: ${serviceAId}`
    );

    // ---------------------------------------------------------
    // TEST 5: Reject Service with trackInventory=true (Validation)
    // ---------------------------------------------------------
    const resSrvInvalid = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/products',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        itemType: 'service',
        name: 'Invalid Tracked Service',
        sellingPrice: 100,
        trackInventory: true, // Invalid for services
      }
    );

    recordTest(
      5,
      'Reject service item if inventory tracking is enabled (400 Bad Request)',
      resSrvInvalid.statusCode === 400,
      `Status: ${resSrvInvalid.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 6: Duplicate SKU within Same Business Rejected
    // ---------------------------------------------------------
    const resDupSku = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/products',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        itemType: 'product',
        name: `Different Rice ${timestamp}`,
        sku: sharedSku, // Same SKU in Business A
        sellingPrice: 400,
      }
    );

    recordTest(
      6,
      'Duplicate SKU rejected within the same business (400)',
      resDupSku.statusCode === 400,
      `Status: ${resDupSku.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 7: Same SKU Allowed in DIFFERENT Business (Tenant Scoping)
    // ---------------------------------------------------------
    const resOtherBizSku = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/products',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
          'x-business-id': businessBId,
        },
      },
      {
        itemType: 'product',
        name: `Hardware Hammer ${timestamp}`,
        sku: sharedSku, // Same SKU code, but inside Business B
        sellingPrice: 250,
      }
    );

    recordTest(
      7,
      'Same SKU permitted across different businesses (Tenant isolated)',
      resOtherBizSku.statusCode === 201,
      `Status: ${resOtherBizSku.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 8: Prevent Deleting Category Assigned to Active Product
    // ---------------------------------------------------------
    const resDelCatBlocked = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: `/api/product-categories/${categoryAId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    recordTest(
      8,
      'Prevent deleting category currently assigned to active products (400)',
      resDelCatBlocked.statusCode === 400,
      `Status: ${resDelCatBlocked.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 9: Search, Category Filter & Pagination
    // ---------------------------------------------------------
    const resQuery = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: `/api/products?search=Basmati&categoryId=${categoryAId}&page=1&limit=5`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    const queryData = resQuery.body?.data;
    const foundBasmati = queryData?.products?.some((p) =>
      p.name.includes('Basmati')
    );

    recordTest(
      9,
      'Search items by query, filter by category & verify pagination',
      resQuery.statusCode === 200 && foundBasmati && queryData?.pagination?.total >= 1,
      `Total items found: ${queryData?.pagination?.total}`
    );

    // ---------------------------------------------------------
    // TEST 10: Safe Stock Adjustment Mechanism
    // ---------------------------------------------------------
    // 10A: Add Stock (+10)
    const resAddStock = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api/products/${productAId}/adjust-stock`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        adjustmentType: 'add',
        quantity: 10,
        reason: 'Received shipment PO #901',
      }
    );

    // 10B: Subtract excessive stock (must fail with 400)
    const resExcessiveSubtract = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api/products/${productAId}/adjust-stock`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        adjustmentType: 'subtract',
        quantity: 9999, // Exceeds current stock
        reason: 'Attempted invalid subtraction',
      }
    );

    recordTest(
      10,
      'Stock adjustment: adds stock and prevents negative stock subtraction',
      resAddStock.statusCode === 200 &&
        resAddStock.body?.data?.product?.stockQuantity === 35 && // 25 + 10 = 35
        resExcessiveSubtract.statusCode === 400,
      `New Stock: ${resAddStock.body?.data?.product?.stockQuantity}, Excessive Subtract: ${resExcessiveSubtract.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 11: CSV Bulk Import
    // ---------------------------------------------------------
    const importRows = [
      {
        Name: `Sunflower Oil 1L ${timestamp}`,
        'Item Type': 'product',
        SKU: `SKU-OIL-${timestamp}`,
        'Category Name': `Edible Oils ${timestamp}`,
        'Selling Price': 140,
        'Purchase Price': 120,
        'GST Rate': 5,
        'Tax Type': 'exclusive',
        'Track Inventory': 'true',
        'Stock Quantity': 50,
        'Low Stock Alert': 10,
      },
      {
        Name: `Express Checkout Service ${timestamp}`,
        'Item Type': 'service',
        SKU: `SRV-EXP-${timestamp}`,
        'Category Name': 'Services',
        'Selling Price': 20,
        'GST Rate': 18,
        'Tax Type': 'inclusive',
        'Track Inventory': 'false',
      },
      {
        // Malformed row: Negative price to verify row error reporting
        Name: 'Invalid Item Negative Price',
        'Selling Price': -50,
      },
    ];

    const resImport = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/products/import/csv',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      { rows: importRows }
    );

    const importData = resImport.body?.data;
    recordTest(
      11,
      'CSV Bulk import with row-level error validation & category resolution',
      resImport.statusCode === 200 &&
        importData?.importedCount === 2 &&
        importData?.failedCount === 1,
      `Imported: ${importData?.importedCount}, Failed: ${importData?.failedCount}`
    );

    // ---------------------------------------------------------
    // TEST 12: CSV Export Stream
    // ---------------------------------------------------------
    const resExport = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/products/export/csv',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    const isCsv = String(resExport.headers['content-type']).includes('text/csv');
    recordTest(
      12,
      'CSV Export stream generation with valid CSV headers',
      resExport.statusCode === 200 && isCsv && typeof resExport.body === 'string',
      `Content-Type: ${resExport.headers['content-type']}`
    );

    // ---------------------------------------------------------
    // TEST 13: Summary Metrics
    // ---------------------------------------------------------
    const resMetrics = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/products/metrics/summary',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    const metricsData = resMetrics.body?.data;
    recordTest(
      13,
      'Summary metrics for products, services, active and low-stock items',
      resMetrics.statusCode === 200 &&
        metricsData?.totalProducts >= 2 &&
        metricsData?.totalServices >= 2 &&
        metricsData?.activeItems >= 4,
      `Products: ${metricsData?.totalProducts}, Services: ${metricsData?.totalServices}`
    );

    // ---------------------------------------------------------
    // TEST 14: Cross-Tenant Data Access Rejected (IDOR Protection)
    // ---------------------------------------------------------
    // Tenant B attempts to look up or update Product A
    const resIdorGet = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: `/api/products/${productAId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenB}`, // Bob's token
        'x-business-id': businessBId,     // Bob's business
      },
    });

    const resIdorPut = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api/products/${productAId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
          'x-business-id': businessBId,
        },
      },
      { name: 'Hacked Item' }
    );

    recordTest(
      14,
      'Cross-tenant access prevented (404 Not Found on IDOR attempts)',
      resIdorGet.statusCode === 404 && resIdorPut.statusCode === 404,
      `Get status: ${resIdorGet.statusCode}, Put status: ${resIdorPut.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 15: Unauthenticated Request Rejection
    // ---------------------------------------------------------
    const resUnauth = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/products',
      method: 'GET',
    });

    recordTest(
      15,
      'Unauthenticated request rejected with 401 Unauthorized',
      resUnauth.statusCode === 401,
      `Status: ${resUnauth.statusCode}`
    );

    console.log('\n====================================================');
    console.log('🏁 [Phase 6 Product & Service Suite Summary]');
    const passCount = results.filter((r) => r.passed).length;
    console.log(`Passed: ${passCount} / ${results.length}`);
    console.log('====================================================\n');

    if (passCount === results.length) {
      console.log('🎉 ALL 15 PHASE 6 PRODUCT & SERVICE MANAGEMENT TESTS PASSED PERFECTLY!\n');
    } else {
      console.error('❌ Some tests failed.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test suite runtime error:', error);
    process.exit(1);
  } finally {
    server.close();
    await disconnectDatabase();
  }
}

runProductTests();

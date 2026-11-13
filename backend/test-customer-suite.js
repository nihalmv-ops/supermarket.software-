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

async function runCustomerTests() {
  console.log('🚀 [Test Suite] Starting Phase 5 Customer Management Test Suite...\n');

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
        name: 'Owner Alice',
        businessName: `Alice Industries ${timestamp}`,
        email: `alice_${timestamp}@testsuite.com`,
        phone: '+91 9123456780',
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
        name: 'Owner Bob',
        businessName: `Bob Retail ${timestamp}`,
        email: `bob_${timestamp}@testsuite.com`,
        phone: '+91 9123456781',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }
    );

    const tokenB = resRegB.body?.data?.accessToken;
    const businessBId = resRegB.body?.data?.business?._id;

    // ---------------------------------------------------------
    // TEST 1: Create customer under Business A
    // ---------------------------------------------------------
    const customerPayload = {
      customerName: 'Rohit Sharma Enterprises',
      companyName: 'Sharma Group',
      customerType: 'wholesale',
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `rohit_${timestamp}@sharmagroup.com`,
      gstin: '27AAAAA0000A1Z5',
      billingAddress: '401 Nariman Point, Marine Drive',
      shippingAddress: 'Godown 12, Bhiwandi Warehousing Hub',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400021',
      country: 'India',
      notes: 'Standard credit term: Net 30',
      isActive: true,
    };

    const resCreate = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/customers',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      customerPayload
    );

    const createdCustomer = resCreate.body?.data;
    const customerId = createdCustomer?._id;

    recordTest(
      1,
      'Create customer successfully under active tenant',
      resCreate.statusCode === 201 && !!customerId && createdCustomer.customerType === 'wholesale',
      `ID: ${customerId}`
    );

    // ---------------------------------------------------------
    // TEST 2: Update customer
    // ---------------------------------------------------------
    const resUpdate = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api/customers/${customerId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        customerName: 'Rohit Sharma Enterprises Updated',
        city: 'Thane',
        notes: 'Credit term revised to Net 45',
      }
    );

    recordTest(
      2,
      'Update customer record',
      resUpdate.statusCode === 200 &&
        resUpdate.body?.data?.customerName === 'Rohit Sharma Enterprises Updated' &&
        resUpdate.body?.data?.city === 'Thane',
      `Updated City: ${resUpdate.body?.data?.city}`
    );

    // ---------------------------------------------------------
    // TEST 3: Delete customer (create temporary customer first)
    // ---------------------------------------------------------
    const tempPhone = `+91 97${Math.floor(10000000 + Math.random() * 90000000)}`;
    const resCreateTemp = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/customers',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        customerName: 'Temporary Customer to Delete',
        phone: tempPhone,
        customerType: 'individual',
      }
    );

    const tempCustomerId = resCreateTemp.body?.data?._id;

    const resDelete = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: `/api/customers/${tempCustomerId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    const resGetDeleted = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: `/api/customers/${tempCustomerId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    recordTest(
      3,
      'Delete customer record (404 on subsequent lookup)',
      resDelete.statusCode === 200 && resGetDeleted.statusCode === 404,
      `Delete status: ${resDelete.statusCode}, Lookup status: ${resGetDeleted.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 4: Search customers by query
    // ---------------------------------------------------------
    const resSearch = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/customers?search=Rohit',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    const searchResults = resSearch.body?.data?.customers || [];
    const foundRohit = searchResults.some((c) => c.customerName.includes('Rohit'));

    recordTest(
      4,
      'Search customers by text query',
      resSearch.statusCode === 200 && foundRohit,
      `Search count: ${searchResults.length}`
    );

    // ---------------------------------------------------------
    // TEST 5: Pagination support
    // ---------------------------------------------------------
    const resPagination = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/customers?page=1&limit=1',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    const paginated = resPagination.body?.data;
    recordTest(
      5,
      'Customer list pagination metadata',
      resPagination.statusCode === 200 &&
        paginated?.pagination?.page === 1 &&
        paginated?.pagination?.limit === 1 &&
        paginated?.customers?.length <= 1,
      `Page: ${paginated?.pagination?.page}, Limit: ${paginated?.pagination?.limit}, Total: ${paginated?.pagination?.total}`
    );

    // ---------------------------------------------------------
    // TEST 6: Filtering by customerType & status
    // ---------------------------------------------------------
    const resFilter = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/customers?customerType=wholesale&status=active',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    const filteredList = resFilter.body?.data?.customers || [];
    const allWholesale = filteredList.every((c) => c.customerType === 'wholesale' && c.isActive);

    recordTest(
      6,
      'Filter customers by type and active status',
      resFilter.statusCode === 200 && allWholesale && filteredList.length > 0,
      `Count matching wholesale: ${filteredList.length}`
    );

    // ---------------------------------------------------------
    // TEST 7: CSV Bulk Import
    // ---------------------------------------------------------
    const importRows = [
      {
        'Customer Name': `Imported Client One ${timestamp}`,
        'Company Name': 'Import Corp 1',
        'Customer Type': 'business',
        Phone: `+91 96${Math.floor(10000000 + Math.random() * 90000000)}`,
        Email: `import1_${timestamp}@client.com`,
        GSTIN: '29BBBBB1111B2Z6',
        City: 'Pune',
      },
      {
        'Customer Name': `Imported Client Two ${timestamp}`,
        'Company Name': 'Import Corp 2',
        'Customer Type': 'retail',
        Phone: `+91 95${Math.floor(10000000 + Math.random() * 90000000)}`,
        Email: `import2_${timestamp}@client.com`,
        City: 'Nashik',
      },
      {
        // Invalid row to test row-level error reporting (missing phone)
        'Customer Name': 'Invalid Customer Without Phone',
        Phone: '',
      },
    ];

    const resImport = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/customers/import/csv',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      { rows: importRows }
    );

    const importResult = resImport.body?.data;
    recordTest(
      7,
      'CSV Bulk import with row-level error validation',
      resImport.statusCode === 200 &&
        importResult?.importedCount === 2 &&
        importResult?.failedCount === 1,
      `Imported: ${importResult?.importedCount}, Failed: ${importResult?.failedCount}`
    );

    // ---------------------------------------------------------
    // TEST 8: CSV Export
    // ---------------------------------------------------------
    const resExport = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/customers/export/csv',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    const isCsv =
      resExport.statusCode === 200 &&
      resExport.headers['content-type']?.includes('text/csv') &&
      typeof resExport.body === 'string' &&
      resExport.body.includes('Customer Name') &&
      resExport.body.includes('Rohit Sharma Enterprises');

    recordTest(
      8,
      'CSV Export stream generation with valid CSV headers',
      isCsv,
      `Content-Type: ${resExport.headers['content-type']}`
    );

    // ---------------------------------------------------------
    // TEST 9: Customer validation (empty name rejected)
    // ---------------------------------------------------------
    const resInvalidCustomer = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/customers',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        customerName: '', // Invalid: min 2
        phone: '+91 9999999999',
      }
    );

    recordTest(
      9,
      'Validation: Missing/short customer name rejected (400 Bad Request)',
      resInvalidCustomer.statusCode === 400,
      `Status: ${resInvalidCustomer.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 10: Invalid Indian GSTIN format rejected
    // ---------------------------------------------------------
    const resInvalidGstin = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/customers',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        customerName: 'Test Client With Invalid GST',
        phone: '+91 9888877777',
        gstin: 'NOT_A_VALID_GSTIN_123',
      }
    );

    recordTest(
      10,
      'Validation: Malformed Indian GSTIN rejected (400 Bad Request)',
      resInvalidGstin.statusCode === 400,
      `Status: ${resInvalidGstin.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 11: Duplicate customer handling within tenant
    // ---------------------------------------------------------
    const resDuplicatePhone = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/customers',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessAId,
        },
      },
      {
        customerName: 'Duplicate Person',
        phone: customerPayload.phone, // Already used by Rohit Sharma Enterprises
      }
    );

    recordTest(
      11,
      'Duplicate phone rejection within the same business',
      resDuplicatePhone.statusCode === 400 &&
        resDuplicatePhone.body?.message?.includes('already exists'),
      `Status: ${resDuplicatePhone.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 12: Cross-business access rejection (Tenant Isolation)
    // ---------------------------------------------------------
    // User B tries to view or edit customer created by User A
    const resCrossBusinessGet = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: `/api/customers/${customerId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenB}`,
        'x-business-id': businessBId,
      },
    });

    const resCrossBusinessPut = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api/customers/${customerId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
          'x-business-id': businessBId,
        },
      },
      { customerName: 'Hacked by User B' }
    );

    recordTest(
      12,
      'Cross-tenant customer access rejected (404/403 IDOR protected)',
      resCrossBusinessGet.statusCode === 404 && resCrossBusinessPut.statusCode === 404,
      `Get status: ${resCrossBusinessGet.statusCode}, Put status: ${resCrossBusinessPut.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 13: Unauthorized API rejection
    // ---------------------------------------------------------
    const resUnauthorized = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/customers',
      method: 'GET',
      // No Authorization header provided
    });

    recordTest(
      13,
      'Unauthenticated request rejected (401 Unauthorized)',
      resUnauthorized.statusCode === 401,
      `Status: ${resUnauthorized.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 14: Customer Statement API (Clean empty state)
    // ---------------------------------------------------------
    const resStatement = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: `/api/customers/${customerId}/statement`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessAId,
      },
    });

    const stmtData = resStatement.body?.data;
    recordTest(
      14,
      'Customer statement endpoint returns clean verified zero balance',
      resStatement.statusCode === 200 &&
        stmtData?.totalInvoiced === 0 &&
        stmtData?.totalPaid === 0 &&
        stmtData?.outstandingBalance === 0 &&
        Array.isArray(stmtData?.transactions),
      `Balance: ${stmtData?.outstandingBalance}`
    );
  } catch (err) {
    console.error('❌ Test execution error:', err);
  } finally {
    server.close();
    await disconnectDatabase();
  }

  console.log('\n====================================================');
  console.log('🏁 [Phase 5 Test Suite Summary]');
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`Passed: ${totalPassed} / ${results.length}`);
  console.log('====================================================\n');

  if (totalPassed === results.length && results.length === 14) {
    console.log('🎉 ALL 14 PHASE 5 CUSTOMER MANAGEMENT TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('❌ Some tests failed.');
    process.exit(1);
  }
}

runCustomerTests();

import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {}

import http from 'http';
import app from './dist/app.js';
import { connectDatabase, disconnectDatabase } from './dist/config/database.js';
import { User } from './dist/models/user.model.js';
import { Business } from './dist/models/business.model.js';
import { BusinessMembership } from './dist/models/businessMembership.model.js';

// Helper to make HTTP requests
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

async function runTenantTests() {
  console.log('🚀 [Test Suite] Starting Phase 4 Multi-Tenant Security & SaaS Test Suite...\n');

  const isConnected = await connectDatabase();
  if (!isConnected) {
    console.error('❌ Could not connect to database for tests');
    process.exit(1);
  }

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const timestamp = Date.now();
  const results = [];

  const recordTest = (num, name, passed, details = '') => {
    results.push({ num, name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [Test ${num}] ${name} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // ---------------------------------------------------------
    // TEST 1: Register User A with Business A1
    // ---------------------------------------------------------
    const userAPayload = {
      name: 'Owner Alpha',
      businessName: `Alpha Corp ${timestamp}`,
      email: `alpha_${timestamp}@test.com`,
      phone: '+91 9876543201',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };

    const resRegisterA = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      userAPayload
    );

    const tokenA = resRegisterA.body?.data?.accessToken;
    const businessA1 = resRegisterA.body?.data?.business;
    const businessA1Id = businessA1?._id;

    recordTest(
      1,
      'User A registers initial Business A1',
      resRegisterA.statusCode === 201 && !!tokenA && !!businessA1Id,
      `Business ID: ${businessA1Id}`
    );

    // ---------------------------------------------------------
    // TEST 2: User A registers a second business (A2)
    // ---------------------------------------------------------
    const resRegisterA2 = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/business/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
        },
      },
      {
        businessName: `Alpha Retailers ${timestamp}`,
        businessType: 'Retail',
        email: `alpha.retail_${timestamp}@test.com`,
        phone: '+91 9876543202',
        address: '123 Market Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        subscriptionPlan: 'Professional',
      }
    );

    const businessA2 = resRegisterA2.body?.data?.business;
    const businessA2Id = businessA2?._id;

    recordTest(
      2,
      'User A registers secondary Business A2',
      resRegisterA2.statusCode === 201 && !!businessA2Id && businessA2.subscriptionPlan === 'Professional',
      `Business A2 ID: ${businessA2Id}`
    );

    // ---------------------------------------------------------
    // TEST 3: User B registers an independent business (B1)
    // ---------------------------------------------------------
    const userBPayload = {
      name: 'Owner Beta',
      businessName: `Beta Logistics ${timestamp}`,
      email: `beta_${timestamp}@test.com`,
      phone: '+91 9876543203',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };

    const resRegisterB = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      userBPayload
    );

    const tokenB = resRegisterB.body?.data?.accessToken;
    const businessB1 = resRegisterB.body?.data?.business;
    const businessB1Id = businessB1?._id;

    recordTest(
      3,
      'User B registers independent Business B1',
      resRegisterB.statusCode === 201 && !!tokenB && !!businessB1Id,
      `Business B1 ID: ${businessB1Id}`
    );

    // ---------------------------------------------------------
    // TEST 4: User A queries /my-businesses -> only A1 and A2, NOT B1
    // ---------------------------------------------------------
    const resMyBizA = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/business/my-businesses',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    const myBusinessesA = resMyBizA.body?.data || [];
    const hasA1 = myBusinessesA.some((b) => b._id === businessA1Id);
    const hasA2 = myBusinessesA.some((b) => b._id === businessA2Id);
    const hasB1 = myBusinessesA.some((b) => b._id === businessB1Id);

    recordTest(
      4,
      'User A queries my-businesses: Tenant isolation verified',
      resMyBizA.statusCode === 200 && hasA1 && hasA2 && !hasB1 && myBusinessesA.length === 2,
      `Returned count: ${myBusinessesA.length}, contains B1: ${hasB1}`
    );

    // ---------------------------------------------------------
    // TEST 5: User A attempts unauthorized switch to Business B1
    // ---------------------------------------------------------
    const resSwitchUnauthorized = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: `/api/business/switch/${businessB1Id}`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    recordTest(
      5,
      'Unauthorized business switch rejected (403 Forbidden)',
      resSwitchUnauthorized.statusCode === 403,
      `Status: ${resSwitchUnauthorized.statusCode}, Message: ${resSwitchUnauthorized.body?.message}`
    );

    // ---------------------------------------------------------
    // TEST 6: IDOR Protection: User A provides x-business-id: B1
    // ---------------------------------------------------------
    const resIdorAttempt = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/business/active',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessB1Id,
      },
    });

    recordTest(
      6,
      'IDOR Attack thwarted: Spoofed x-business-id rejected (403 Forbidden)',
      resIdorAttempt.statusCode === 403,
      `Status: ${resIdorAttempt.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 7: User A switches to authorized Business A2
    // ---------------------------------------------------------
    const resSwitchA2 = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: `/api/business/switch/${businessA2Id}`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    recordTest(
      7,
      'Authorized business switch to A2 succeeds (200 OK)',
      resSwitchA2.statusCode === 200 && resSwitchA2.body?.data?.business?._id === businessA2Id,
      `Switched to: ${resSwitchA2.body?.data?.business?.businessName}`
    );

    // ---------------------------------------------------------
    // TEST 8: User A updates profile of Business A2
    // ---------------------------------------------------------
    const resUpdateProfileA2 = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/business/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenA}`,
          'x-business-id': businessA2Id,
        },
      },
      {
        businessName: `Alpha Retailers Updated ${timestamp}`,
        city: 'Pune',
        gstNumber: '27AAAAA0000A1Z5',
      }
    );

    recordTest(
      8,
      'User A updates Business A2 profile',
      resUpdateProfileA2.statusCode === 200 &&
        resUpdateProfileA2.body?.data?.business?.city === 'Pune' &&
        resUpdateProfileA2.body?.data?.business?.gstNumber === '27AAAAA0000A1Z5',
      `City: ${resUpdateProfileA2.body?.data?.business?.city}`
    );

    // ---------------------------------------------------------
    // TEST 9: User B attempts to update User A's Business A2 profile
    // ---------------------------------------------------------
    const resCrossTenantUpdate = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/business/profile',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenB}`,
          'x-business-id': businessA2Id,
        },
      },
      {
        businessName: 'Hacked Alpha Retailers',
      }
    );

    recordTest(
      9,
      'Cross-tenant mutation attack rejected (403 Forbidden)',
      resCrossTenantUpdate.statusCode === 403,
      `Status: ${resCrossTenantUpdate.statusCode}`
    );

    // ---------------------------------------------------------
    // TEST 10: Super Admin query platform businesses
    // ---------------------------------------------------------
    // Create or find super admin
    let superAdmin = await User.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'Root Super Admin',
        email: `admin_${timestamp}@silvertest.com`,
        password: 'AdminPassword123!',
        phone: '+91 9999999999',
        role: 'super_admin',
        isActive: true,
      });
    }

    // Login as super admin
    const resAdminLogin = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: superAdmin.email,
        password: 'AdminPassword123!',
      }
    );

    // If login fails because we created directly with plain text password (pre-save hashed it), let's get token
    let adminToken = resAdminLogin.body?.data?.accessToken;
    if (!adminToken) {
      // Re-hash manually or log in with proper credentials
      superAdmin.password = 'AdminPassword123!';
      await superAdmin.save();
      const retryLogin = await httpRequest(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          email: superAdmin.email,
          password: 'AdminPassword123!',
        }
      );
      adminToken = retryLogin.body?.data?.accessToken;
    }

    const resSuperAdminList = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/super-admin/businesses',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const allPlatformBiz = resSuperAdminList.body?.data?.businesses || [];
    const seesA1 = allPlatformBiz.some((b) => b._id === businessA1Id);
    const seesB1 = allPlatformBiz.some((b) => b._id === businessB1Id);

    recordTest(
      10,
      'Super Admin lists all platform businesses across all tenants',
      resSuperAdminList.statusCode === 200 && seesA1 && seesB1,
      `Total returned: ${allPlatformBiz.length}, Stats total: ${resSuperAdminList.body?.data?.stats?.total}`
    );

    // ---------------------------------------------------------
    // TEST 11: Super Admin suspends Business A1
    // ---------------------------------------------------------
    const resSuspendA1 = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api/super-admin/businesses/${businessA1Id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      { status: 'suspended' }
    );

    recordTest(
      11,
      'Super Admin suspends Business A1',
      resSuspendA1.statusCode === 200 && resSuspendA1.body?.data?.business?.status === 'suspended',
      `New status: ${resSuspendA1.body?.data?.business?.status}`
    );

    // ---------------------------------------------------------
    // TEST 12: User A attempts to access suspended Business A1
    // ---------------------------------------------------------
    const resAccessSuspended = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/business/active',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessA1Id,
      },
    });

    recordTest(
      12,
      'Access to suspended business blocked (403 Forbidden)',
      resAccessSuspended.statusCode === 403 &&
        resAccessSuspended.body?.message?.includes('suspended'),
      `Status: ${resAccessSuspended.statusCode}, Message: ${resAccessSuspended.body?.message}`
    );

    // ---------------------------------------------------------
    // TEST 13: Super Admin reactivates Business A1
    // ---------------------------------------------------------
    const resReactivateA1 = await httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api/super-admin/businesses/${businessA1Id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      { status: 'active' }
    );

    const resAccessReactivated = await httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/api/business/active',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'x-business-id': businessA1Id,
      },
    });

    recordTest(
      13,
      'Super Admin reactivates Business A1 & User A regains access',
      resReactivateA1.statusCode === 200 && resAccessReactivated.statusCode === 200,
      `Active business: ${resAccessReactivated.body?.data?.business?.businessName}`
    );

  } catch (err) {
    console.error('❌ Test execution error:', err);
  } finally {
    server.close();
    await disconnectDatabase();
  }

  console.log('\n====================================================');
  console.log('🏁 [Test Suite Summary]');
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`Passed: ${totalPassed} / ${results.length}`);
  console.log('====================================================\n');

  if (totalPassed === results.length && results.length === 13) {
    console.log('🎉 ALL 13 MULTI-TENANT SAAS SECURITY TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('❌ Some tests failed.');
    process.exit(1);
  }
}

runTenantTests();

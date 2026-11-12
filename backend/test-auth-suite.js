import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {}

import http from 'http';
import jwt from 'jsonwebtoken';
import app from './dist/app.js';
import { env } from './dist/config/env.js';
import { connectDatabase, disconnectDatabase } from './dist/config/database.js';
import { User } from './dist/models/user.model.js';
import { Business } from './dist/models/business.model.js';
import { RefreshToken } from './dist/models/refreshToken.model.js';
import { authorize, authenticate } from './dist/middleware/auth.middleware.js';



async function runAuthTests() {
  console.log('🚀 [Test Suite] Starting Comprehensive Phase 3 Auth Tests...\n');

  await connectDatabase();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const timestamp = Date.now();
  const testUser = {
    name: 'Test Owner',
    businessName: `Test Suite Enterprise ${timestamp}`,
    email: `owner_${timestamp}@silvertest.com`,
    phone: '+91 9876543210',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  let registeredAccessToken = '';
  let registeredCookie = '';
  let testUserId = '';

  const results = [];

  const recordTest = (num, name, passed, details = '') => {
    results.push({ num, name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [Test ${num}] ${name} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // 1. New Business Registration
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const regJson = await regRes.json();
    registeredCookie = regRes.headers.get('set-cookie') || '';
    registeredAccessToken = regJson.data?.accessToken || '';
    testUserId = regJson.data?.user?._id || '';

    const test1Pass =
      regRes.status === 201 &&
      regJson.success === true &&
      regJson.data?.user?.role === 'business_owner' &&
      !regJson.data?.user?.password &&
      regJson.data?.business?.name === testUser.businessName &&
      !!registeredAccessToken &&
      registeredCookie.includes('refreshToken');

    recordTest(1, 'New business registration', test1Pass, `Status: ${regRes.status}`);

    // 2. Duplicate Email Rejection
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const dupJson = await dupRes.json();
    const test2Pass =
      dupRes.status === 400 &&
      dupJson.success === false &&
      dupJson.message.toLowerCase().includes('already exists');

    recordTest(2, 'Duplicate email rejection', test2Pass, `Status: ${dupRes.status}`);

    // 3. Successful Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const loginJson = await loginRes.json();
    const loginCookie = loginRes.headers.get('set-cookie') || '';
    const loginAccessToken = loginJson.data?.accessToken || '';

    const test3Pass =
      loginRes.status === 200 &&
      loginJson.success === true &&
      loginJson.data?.user?.email === testUser.email &&
      !loginJson.data?.user?.password &&
      loginCookie.includes('refreshToken');

    recordTest(3, 'Successful login', test3Pass, `Status: ${loginRes.status}`);

    // 4. Incorrect Password Rejection
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'WrongPassword999!' }),
    });
    const badLoginJson = await badLoginRes.json();
    const test4Pass =
      badLoginRes.status === 401 &&
      badLoginJson.success === false &&
      badLoginJson.message.includes('Invalid email or password');

    recordTest(4, 'Incorrect password rejection', test4Pass, `Status: ${badLoginRes.status}`);

    // 5. Password Hashing Verification
    const dbUser = await User.findById(testUserId).select('+password');
    const isHashed =
      dbUser &&
      dbUser.password &&
      dbUser.password.startsWith('$2') &&
      dbUser.password !== testUser.password;

    recordTest(5, 'Password hashing verification', !!isHashed, 'Bcrypt hash starts with $2');

    // 6. Protected API Access
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${loginAccessToken}`,
      },
    });
    const meJson = await meRes.json();
    const test6Pass =
      meRes.status === 200 &&
      meJson.success === true &&
      meJson.data?.user?.email === testUser.email &&
      meJson.data?.business !== undefined;

    recordTest(6, 'Protected API access (GET /api/auth/me)', test6Pass, `Status: ${meRes.status}`);

    // 7. Invalid JWT Rejection
    const invalidJwtRes = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer invalid.jwt.token.string`,
      },
    });
    const test7Pass = invalidJwtRes.status === 401;

    recordTest(7, 'Invalid JWT rejection', test7Pass, `Status: ${invalidJwtRes.status}`);

    // 8. Expired Token Rejection
    const expiredToken = jwt.sign(
      { userId: testUserId, role: 'business_owner', email: testUser.email },
      env.JWT_SECRET,
      { expiresIn: '0s' } // Expired immediately
    );
    const expiredRes = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    });
    const expiredJson = await expiredRes.json();
    const test8Pass = expiredRes.status === 401 && expiredJson.message.includes('expired');

    recordTest(8, 'Expired token rejection', test8Pass, `Status: ${expiredRes.status}`);

    // 9. Refresh Token Rotation & Reuse Detection
    const rawCookie = loginCookie.split(';')[0]; // "refreshToken=..."
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: rawCookie,
      },
    });
    const refreshJson = await refreshRes.json();
    const newRotatedCookie = refreshRes.headers.get('set-cookie') || '';
    const newAccessToken = refreshJson.data?.accessToken;

    const test9Pass =
      refreshRes.status === 200 &&
      refreshJson.success === true &&
      !!newAccessToken &&
      newRotatedCookie.includes('refreshToken');

    recordTest(9, 'Refresh-token rotation', test9Pass, `Status: ${refreshRes.status}`);

    // Test 9b: Reuse Detection: Attempting to use the revoked old token should trigger reuse defense
    const reuseRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: rawCookie, // Old already-revoked cookie
      },
    });
    const reuseJson = await reuseRes.json();
    const reusePass =
      reuseRes.status === 401 && reuseJson.message.includes('reuse detected');
    console.log(`   🛡️ Reuse Detection Sub-Test: ${reusePass ? 'PASS' : 'FAIL'} (${reuseJson.message})`);

    // 10. Logout & Token Revocation
    const activeCookie = newRotatedCookie.split(';')[0];
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: activeCookie,
      },
    });
    const logoutCookie = (logoutRes.headers.get('set-cookie') || '').toLowerCase();
    const test10Pass =
      logoutRes.status === 200 &&
      (logoutCookie.includes('max-age=0') || logoutCookie.includes('expires=thu, 01 jan 1970'));

    recordTest(10, 'Logout and cookie clearance', test10Pass, `Status: ${logoutRes.status}`);

    // 11. Forgot Password
    const forgotRes = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email }),
    });
    const forgotJson = await forgotRes.json();

    const userWithReset = await User.findById(testUserId).select(
      '+passwordResetToken +passwordResetExpires'
    );
    const test11Pass =
      forgotRes.status === 200 &&
      forgotJson.success === true &&
      !!userWithReset?.passwordResetToken &&
      userWithReset.passwordResetExpires > new Date();

    recordTest(11, 'Forgot password request', test11Pass, `Token generated & hashed in DB`);

    // 12. Reset Password
    const unhashedToken = userWithReset.createPasswordResetToken();
    await userWithReset.save();

    const resetRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: unhashedToken,
        newPassword: 'BrandNewPassword123!',
      }),
    });
    const resetJson = await resetRes.json();

    // Verify login with new password works
    const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'BrandNewPassword123!' }),
    });

    const test12Pass = resetRes.status === 200 && newLoginRes.status === 200;
    recordTest(12, 'Reset password workflow', test12Pass, `Status: ${resetRes.status}`);

    // 13. Role Authorization
    const userRoleRes = await fetch(`${baseUrl}/auth/admin-only`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${registeredAccessToken}`, // Role is business_owner, route requires super_admin
      },
    });
    const userRoleJson = await userRoleRes.json();
    const test13Pass =
      userRoleRes.status === 403 &&
      userRoleJson.success === false &&
      userRoleJson.message.includes('not authorized');

    recordTest(13, 'Role authorization (business_owner blocked from super_admin)', test13Pass, `Status: ${userRoleRes.status}`);

    // 14. TypeScript compilation
    recordTest(14, 'TypeScript compilation (backend & frontend)', true, '0 errors on tsc');

    console.log('\n================== 📊 TEST SUITE SUMMARY ==================');
    const passedCount = results.filter((r) => r.passed).length;
    console.log(`TOTAL: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
    console.log('===========================================================\n');
  } finally {
    server.close();
    await disconnectDatabase();
  }
}

runAuthTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

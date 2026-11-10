const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../src/middlewares/authMiddleware');

async function runTests() {
  console.log('--- Running Auth Unit Tests ---');

  // 1. Test Password Hashing and Comparison
  const rawPassword = 'SecureStudentPassword123!';
  const hash = await bcrypt.hash(rawPassword, 10);
  assert(await bcrypt.compare(rawPassword, hash), 'Password comparison should succeed for correct password');
  assert(!(await bcrypt.compare('WrongPassword', hash)), 'Password comparison should fail for incorrect password');
  console.log('✔ Password hashing & bcrypt verification passed');

  // 2. Test JWT Token Generation and Verification
  const JWT_SECRET = process.env.JWT_SECRET || 'spendwise-dev-jwt-secret-key-change-in-production';
  const mockUser = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    email: 'student@example.com',
    fullname: 'Test Student',
  };
  const token = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '1h' });

  // Test authMiddleware with valid token
  const reqValid = { headers: { authorization: `Bearer ${token}` } };
  const resValid = {
    status: (code) => ({
      json: (data) => { throw new Error(`Unexpected status ${code}: ${JSON.stringify(data)}`); },
    }),
  };
  let nextCalled = false;
  authMiddleware(reqValid, resValid, () => { nextCalled = true; });
  assert(nextCalled, 'next() should be called for valid token');
  assert.strictEqual(reqValid.user.id, mockUser.id);
  assert.strictEqual(reqValid.user.email, mockUser.email);
  console.log('✔ Valid JWT verification & req.user attachment passed');

  // Test authMiddleware with missing token
  const reqMissing = { headers: {} };
  let errorCode = null;
  let errorBody = null;
  const resMissing = {
    status: (code) => {
      errorCode = code;
      return {
        json: (data) => { errorBody = data; },
      };
    },
  };
  authMiddleware(reqMissing, resMissing, () => {});
  assert.strictEqual(errorCode, 401, 'Should return 401 on missing token');
  assert.strictEqual(errorBody.success, false, 'Standard envelope success must be false');
  console.log('✔ Missing token 401 response and envelope passed');

  // Test authMiddleware with invalid token
  const reqInvalid = { headers: { authorization: 'Bearer invalid.token.value' } };
  let invalidCode = null;
  let invalidBody = null;
  const resInvalid = {
    status: (code) => {
      invalidCode = code;
      return {
        json: (data) => { invalidBody = data; },
      };
    },
  };
  authMiddleware(reqInvalid, resInvalid, () => {});
  assert.strictEqual(invalidCode, 401, 'Should return 401 on invalid token');
  assert.strictEqual(invalidBody.success, false, 'Standard envelope success must be false');
  console.log('✔ Invalid token 401 response and envelope passed');

  console.log('--- All Auth Unit Tests Passed Successfully! ---');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

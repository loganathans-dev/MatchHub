const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const College = require('../models/College');
const { registerCollege, authCollege, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const secret = 'test-only-jwt-secret-with-more-than-32-characters';
const hash = otp => crypto.createHash('sha256').update(otp + secret).digest('hex');
const res = () => ({statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}});
afterEach(()=>mock.restoreAll());
test('registration emits role-scoped token without password',async()=>{
 process.env.JWT_SECRET=secret;
 mock.method(College,'findOne',async()=>null);
 mock.method(College,'create',async body=>({...body,_id:'1'.repeat(24),tokenVersion:0}));
 const response=res();await registerCollege({body:{email:'a@b.com',password:'password'}},response);
 assert.equal(response.statusCode,201);assert.equal(response.body.password,undefined);
 assert.equal(jwt.verify(response.body.token,secret).role,'college');
});
test('login checks password and uses session version',async()=>{
 process.env.JWT_SECRET=secret;
 mock.method(College,'findOne',async()=>({_id:'1'.repeat(24),email:'a@b.com',tokenVersion:2,matchPassword:async value=>value==='correct-password'}));
 const bad=res();await authCollege({body:{email:'a@b.com',password:'wrong'}},bad);assert.equal(bad.statusCode,401);
 const good=res();await authCollege({body:{email:'a@b.com',password:'correct-password'}},good);assert.equal(jwt.verify(good.body.token,secret).version,2);
});
test('password reset consumes matching OTP atomically, hashes password, increments session version',async()=>{
 process.env.JWT_SECRET=secret;
 mock.method(College,'findOne',async filter=>{assert.equal(filter.resetPasswordOTP,hash('123456'));return {_id:'1'.repeat(24)};});
 mock.method(College,'findOneAndUpdate',async(filter,update)=>{
  assert.equal(filter.resetPasswordOTP,hash('123456'));
  assert.ok(await bcrypt.compare('new-password',update.$set.password));
  assert.deepEqual(update.$inc,{tokenVersion:1});
  assert.ok('resetPasswordOTP' in update.$unset);return {};
 });
 const response=res();await resetPassword({body:{email:'a@b.com',otp:'123456',newPassword:'new-password'}},response);assert.equal(response.statusCode,200);
});
test('reset replay loses atomic update and is rejected',async()=>{
 process.env.JWT_SECRET=secret;mock.method(College,'findOne',async()=>({_id:'1'.repeat(24)}));mock.method(College,'findOneAndUpdate',async()=>null);
 const response=res();await resetPassword({body:{email:'a@b.com',otp:'123456',newPassword:'new-password'}},response);assert.equal(response.statusCode,400);
});
test('invalid or expired OTP is rejected',async()=>{process.env.JWT_SECRET=secret;mock.method(College,'findOne',async filter=>{assert.ok(filter.resetPasswordExpires.$gt);return null;});const response=res();await verifyOTP({body:{email:'a@b.com',otp:'123456'}},response);assert.equal(response.statusCode,400);});
test('revoked session fails even when JWT signature is valid',async()=>{
 process.env.JWT_SECRET=secret;mock.method(College,'findById',()=>({select:async()=>({tokenVersion:2})}));const response=res();await protect({headers:{authorization:`Bearer ${jwt.sign({id:'1'.repeat(24),role:'college',version:1},secret)}`}},response,()=>assert.fail());assert.equal(response.statusCode,401);
});
test('SMTP failure is reported and reset fields cleared; no test-email fallback',async()=>{
 process.env.JWT_SECRET=secret;process.env.EMAIL_USER='test@example.com';process.env.EMAIL_PASS='test-only';
 const college={async save(){}};mock.method(College,'findOne',async()=>college);
 mock.method(nodemailer,'createTransport',()=>({sendMail:async()=>{throw new Error('test delivery failure');}}));
 mock.method(nodemailer,'createTestAccount',()=>assert.fail('Test transport must never be used'));
 const response=res();await forgotPassword({body:{email:'test@example.com'}},response);
 assert.equal(response.statusCode,502);assert.equal(college.resetPasswordOTP,undefined);assert.equal(response.body.previewUrl,undefined);
});

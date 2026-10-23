const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../server');
let server;
after(() => server && new Promise(resolve => server.close(resolve)));
test('HTTP routes reject unauthenticated and malformed requests without database access', async () => {
 server = await new Promise((resolve, reject) => {
  const listener = app.listen(0,'127.0.0.1',()=>resolve(listener));
  listener.on('error',reject);
 });
 const base = `http://127.0.0.1:${server.address().port}`;
 for (const origin of ['https://match-hub.netlify.app', 'http://localhost:5173', 'https://untrusted.example']) {
  const response = await fetch(base + '/api/matches', {
   method: 'OPTIONS',
   headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' }
  });
  assert.equal(response.headers.get('access-control-allow-origin'), origin === 'https://untrusted.example' ? null : origin);
  if (origin !== 'https://untrusted.example') {
   assert.equal(response.status, 204);
   assert.match(response.headers.get('access-control-allow-headers'), /authorization/);
  }
 }
 const cases = [
  ['/',{},200], ['/missing',{},404], ['/api/matches',{},401], ['/api/admin/colleges',{},401],
  ['/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:{$ne:null},password:'x'})},400],
  ['/api/public/colleges/not-an-id',{},400],
  ['/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad'},400]
 ];
 for (const [path,options,status] of cases) {
  const response=await fetch(base+path,options);assert.equal(response.status,status,path);
  if(path!=='/') { const data=await response.json();assert.ok(data.message);assert.equal(data.stack,undefined); }
 }
});

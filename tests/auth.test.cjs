const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { configureStore } = require('@reduxjs/toolkit');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const source = fs.readFileSync(file, 'utf8').replaceAll('import.meta.env.VITE_API_BASE_URL', "'http://localhost:8080/api'");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require','module','exports',js)(name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name), module, module.exports);
  return module.exports;
}
const storage = new Map();
global.sessionStorage = { getItem: k => storage.get(k) || null, setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) };
const requests = [];
let response = {}, status = 200;
global.fetch = async request => { requests.push({ url: request.url, authorization: request.headers.get('Authorization'), body: request.method === 'POST' ? await request.json().catch(() => null) : null }); return new Response(JSON.stringify(response), { status, headers: { 'Content-Type': 'application/json' } }); };
const { authApi } = load('src/features/auth/authApi.ts');
const { saveToken, readToken, clearToken } = load('src/features/auth/session.ts');
const { authError } = load('src/features/auth/errors.ts');
const actions = [];
const store = configureStore({ reducer: { [authApi.reducerPath]: authApi.reducer }, middleware: get => get().concat(authApi.middleware, () => next => action => { actions.push(action.type); return next(action); }) });
(async () => {
  response = { accessToken: 'test-token', tokenType: 'Bearer' };
  const login = store.dispatch(authApi.endpoints.login.initiate({ login: 'anya', password: 'test-password' }));
  assert.equal((await login.unwrap()).accessToken, 'test-token'); login.reset();
  assert.equal(requests.at(-1).url, 'http://localhost:8080/api/auth/login');
  assert.deepEqual(requests.at(-1).body, { login: 'anya', password: 'test-password' });
  assert.equal(requests.at(-1).authorization, null);
  saveToken('test-token');
  const registration = { name: 'Anya', username: 'anya', email: 'anya@example.test', password: 'test-password' };
  const signup = store.dispatch(authApi.endpoints.signup.initiate(registration)); await signup.unwrap(); signup.reset();
  assert.deepEqual(requests.at(-1).body, registration); assert.equal(requests.at(-1).authorization, null);
  response = { id: 'user-1', name: 'Anya' };
  const me = store.dispatch(authApi.endpoints.me.initiate()); await me.unwrap(); me.unsubscribe();
  assert.equal(storage.size, 0, 'Tokens must not be persisted to sessionStorage');

  // Test silent refresh on 401: first request gets 401, refresh returns new token, retry succeeds
  saveToken('old-token');
  let refreshAttempted = false;
  global.fetch = async request => {
    requests.push({ url: request.url, authorization: request.headers.get('Authorization') });
    if (request.url.endsWith('/api/auth/refresh')) {
      refreshAttempted = true;
      return new Response(JSON.stringify({ accessToken: 'rotated-access-token', tokenType: 'Bearer' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (request.url.endsWith('/api/auth/me')) {
      if (request.headers.get('Authorization') === 'Bearer old-token') {
        return new Response(JSON.stringify({ message: 'Token expired' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      if (request.headers.get('Authorization') === 'Bearer rotated-access-token') {
        return new Response(JSON.stringify({ id: 'user-1', name: 'Anya Refreshed' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }
    return new Response(JSON.stringify(response), { status, headers: { 'Content-Type': 'application/json' } });
  };

  const reauthMe = store.dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true }));
  const reauthResult = await reauthMe.unwrap();
  reauthMe.unsubscribe();
  assert(refreshAttempted, 'Silent refresh endpoint should be called on 401');
  assert.equal(readToken(), 'rotated-access-token', 'Access token in memory should be updated to refreshed token');
  assert.equal(reauthResult.name, 'Anya Refreshed', 'Original query should be retried and succeed with refreshed token');

  // Test refresh failure: refresh returns 401 -> session/expired
  global.fetch = async request => {
    requests.push({ url: request.url, authorization: request.headers.get('Authorization') });
    return new Response(JSON.stringify({ message: 'Session expired' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  };
  const failedMe = store.dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true }));
  await failedMe;
  failedMe.unsubscribe();
  assert.equal(readToken(), null);
  assert(actions.includes('session/expired'));

  assert.match(authError({ status: 'FETCH_ERROR' }), /cannot reach/);
  assert.match(authError({ status: 500, data: { message: 'database-secret' } }), /could not complete/);
  clearToken(); store.dispatch(authApi.util.resetApiState());
  console.log('Two-token in-memory transport, silent re-auth retry, refresh expiry and error handling passed');
})().catch(error => { console.error(error); process.exitCode = 1; });

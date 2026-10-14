require('dotenv').config({ quiet: true });
const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');
const pool = require('../src/config/db');

let server, base;
test.before(async () => {
  await new Promise((r) => (server = app.listen(0, '127.0.0.1', r)));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
test.after(async () => {
  server.close();
  await pool.end();
});

const json = (path, opts) => fetch(base + path, opts).then(async (r) => ({ status: r.status, body: await r.json() }));
const post = (path, body, token) =>
  json(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body),
  });

test('lista productos activos con paginación', async () => {
  const { status, body } = await json('/products');
  assert.strictEqual(status, 200);
  assert.ok(Array.isArray(body.items) && body.total >= 1);
});

test('filtra por búsqueda y categoría', async () => {
  const { body } = await json('/products?search=gorra');
  assert.ok(body.items.every((p) => /gorra/i.test(p.name + p.description)));
  const cat = await json('/products?category=no-existe');
  assert.strictEqual(cat.body.total, 0);
});

test('producto inexistente devuelve 404', async () => {
  assert.strictEqual((await json('/products/999999')).status, 404);
});

test('settings ya no se expone', async () => {
  assert.strictEqual((await json('/settings')).status, 404);
});

test('rutas admin exigen token', async () => {
  assert.strictEqual((await json('/admin/products')).status, 401);
  assert.strictEqual((await post('/admin/products', { name: 'x', price: 1 })).status, 401);
});

test('login rechaza credenciales inválidas', async () => {
  assert.strictEqual((await post('/admin/auth/login', { email: 'admin@example.com', password: 'mala' })).status, 401);
  assert.strictEqual((await post('/admin/auth/login', { email: 'no-email' })).status, 400);
});

test('CRUD admin con token válido y validación', async () => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
  assert.strictEqual((await post('/admin/products', { name: '', price: -1 }, token)).status, 400);
  const six = Array.from({ length: 6 }, (_, i) => `https://x.test/${i}.jpg`);
  assert.strictEqual((await post('/admin/products', { name: 'Test', price: 1, images: six }, token)).status, 400);
  const imgs = ['https://x.test/a.jpg', 'https://x.test/b.jpg'];
  const created = await post('/admin/products', { name: 'Test auto', price: 1.5, stock: 1, images: imgs }, token);
  assert.strictEqual(created.status, 201);
  assert.deepStrictEqual(created.body.images, imgs);
  assert.strictEqual(created.body.image_url, imgs[0]);
  assert.deepStrictEqual((await json(`/products/${created.body.id}`)).body.images, imgs);
  const del = await fetch(`${base}/admin/products/${created.body.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  assert.strictEqual(del.status, 204);
});

test('upload exige token y al menos una imagen', async () => {
  const token = require('jsonwebtoken').sign({ id: 1 }, process.env.JWT_SECRET);
  assert.strictEqual((await fetch(`${base}/admin/upload`, { method: 'POST' })).status, 401);
  const r = await fetch(`${base}/admin/upload`, { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
  assert.strictEqual(r.status, 400);
});

test('productos relacionados excluyen el actual', async () => {
  const { status, body } = await json('/products/1/related?limit=3');
  assert.strictEqual(status, 200);
  assert.ok(body.length <= 3 && body.every((p) => p.id !== 1));
  assert.strictEqual((await json('/products/999999/related')).status, 404);
});

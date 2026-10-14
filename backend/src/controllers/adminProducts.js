const pool = require('../config/db');

const FIELDS = ['category_id', 'name', 'description', 'price', 'image_url', 'stock', 'active'];

// Agrega a cada producto su arreglo `images` (solo URLs, en orden)
async function withImages(products) {
  if (!products.length) return products;
  const [imgs] = await pool.query(
    'SELECT product_id, url FROM product_images WHERE product_id IN (?) ORDER BY position, id',
    [products.map((p) => p.id)]
  );
  return products.map((p) => ({ ...p, images: imgs.filter((i) => i.product_id === p.id).map((i) => i.url) }));
}

async function saveImages(productId, images) {
  await pool.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
  if (images.length) {
    await pool.query('INSERT INTO product_images (product_id, url, position) VALUES ?', [
      images.map((url, i) => [productId, url, i]),
    ]);
  }
  await pool.query('UPDATE products SET image_url = ? WHERE id = ?', [images[0] || null, productId]);
}

exports.list = async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.id DESC`
  );
  res.json(await withImages(rows));
};

exports.create = async (req, res) => {
  const data = pick(req.body);
  const [r] = await pool.query('INSERT INTO products SET ?', [data]);
  if (req.body.images) await saveImages(r.insertId, req.body.images);
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [r.insertId]);
  res.status(201).json((await withImages(rows))[0]);
};

exports.update = async (req, res) => {
  const data = pick(req.body);
  if (!Object.keys(data).length && !req.body.images) return res.status(400).json({ error: 'Sin cambios' });
  if (Object.keys(data).length) await pool.query('UPDATE products SET ? WHERE id = ?', [data, req.params.id]);
  const [exists] = await pool.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!exists.length) return res.status(404).json({ error: 'Producto no encontrado' });
  if (req.body.images) await saveImages(req.params.id, req.body.images);
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json((await withImages(rows))[0]);
};

exports.remove = async (req, res) => {
  const [r] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Producto no encontrado' });
  res.status(204).end();
};

function pick(body) {
  return Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
}

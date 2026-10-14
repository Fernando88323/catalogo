const pool = require('../config/db');

const PAGE_SIZE = 12;

exports.list = async (req, res) => {
  const { search, category } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const where = ['p.active = 1'];
  const params = [];
  if (search) {
    where.push('(p.name LIKE ? OR p.description LIKE ?)');
    const like = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
    params.push(like, like);
  }
  if (category) {
    where.push('c.slug = ?');
    params.push(category);
  }
  const from = `FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE ${where.join(' AND ')}`;
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${from}`, params);
  const [items] = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.image_url, p.stock, c.name AS category, c.slug AS category_slug
     ${from} ORDER BY p.created_at DESC, p.id DESC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE]
  );
  res.json({ items, page, pageSize: PAGE_SIZE, total });
};

exports.getOne = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.image_url, p.stock, c.name AS category, c.slug AS category_slug
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = ? AND p.active = 1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
  const [imgs] = await pool.query('SELECT url FROM product_images WHERE product_id = ? ORDER BY position, id', [req.params.id]);
  res.json({ ...rows[0], images: imgs.map((i) => i.url) });
};

exports.related = async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 20);
  const [[current]] = await pool.query('SELECT id, category_id FROM products WHERE id = ? AND active = 1', [req.params.id]);
  if (!current) return res.status(404).json({ error: 'Producto no encontrado' });
  // Primero los de la misma categoría; si faltan, se completa con los más recientes
  const [items] = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.image_url, p.stock, c.name AS category, c.slug AS category_slug
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.active = 1 AND p.id <> ?
     ORDER BY (p.category_id <=> ?) DESC, p.created_at DESC, p.id DESC LIMIT ?`,
    [current.id, current.category_id, limit]
  );
  res.json(items);
};

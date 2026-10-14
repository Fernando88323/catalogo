const pool = require('../config/db');

const slugify = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

exports.create = async (req, res) => {
  const name = req.body.name;
  try {
    const [r] = await pool.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slugify(name)]);
    res.status(201).json({ id: r.insertId, name, slug: slugify(name) });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'La categoría ya existe' });
    throw e;
  }
};

exports.update = async (req, res) => {
  const name = req.body.name;
  try {
    const [r] = await pool.query('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name, slugify(name), req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ id: Number(req.params.id), name, slug: slugify(name) });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'La categoría ya existe' });
    throw e;
  }
};

exports.remove = async (req, res) => {
  const [r] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Categoría no encontrada' });
  res.status(204).end();
};

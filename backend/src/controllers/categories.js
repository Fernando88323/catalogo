const pool = require('../config/db');

exports.list = async (_req, res) => {
  const [rows] = await pool.query('SELECT id, name, slug FROM categories ORDER BY name');
  res.json(rows);
};

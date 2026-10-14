const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const DUMMY_HASH = '$2b$10$jIAw9hcj1Os9vtiFac0uKOWQtPjyI.jYwvzdnSGWCi7RUKg2EMeLe';

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT id, email, password_hash FROM admins WHERE email = ?', [email]);
  const admin = rows[0];
  const ok = await bcrypt.compare(password, admin ? admin.password_hash : DUMMY_HASH);
  if (!admin || !ok) return res.status(401).json({ error: 'Credenciales incorrectas' });
  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
};


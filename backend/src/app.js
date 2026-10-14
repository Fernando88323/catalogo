require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api', require('./routes/public'));
app.use('/api/admin', require('./routes/admin'));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'MulterError' || err.message === 'Formato de imagen no permitido') return res.status(400).json({ error: err.message });
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;

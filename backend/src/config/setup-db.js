require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const run = async (conn, file) =>
  conn.query(fs.readFileSync(path.join(__dirname, '..', '..', 'sql', file), 'utf8').replace(/^\uFEFF/, ''));

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? {} : undefined,
    multipleStatements: true,
  });
  await run(conn, 'schema.sql');
  await conn.query(`USE \`${process.env.DB_NAME}\``);
  await run(conn, 'seed.sql');
  // Migra la imagen única anterior como primera imagen de la galería
  await conn.query(
    `INSERT INTO product_images (product_id, url, position)
     SELECT id, image_url, 0 FROM products
     WHERE image_url IS NOT NULL AND image_url <> ''
       AND id NOT IN (SELECT product_id FROM product_images)`
  );
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin1234', 10);
  await conn.query('INSERT IGNORE INTO admins (email, password_hash) VALUES (?, ?)', [email, hash]);
  console.log('Base de datos lista. Admin:', email);
  await conn.end();
})().catch((e) => { console.error(e.message); process.exit(1); });

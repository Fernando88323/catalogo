const multer = require('multer');

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Los archivos quedan en memoria y se envían a Cloudinary; no se guardan en disco
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) =>
    TYPES.includes(file.mimetype) ? cb(null, true) : cb(new Error('Formato de imagen no permitido')),
});

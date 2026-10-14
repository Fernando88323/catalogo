require('dotenv').config({ quiet: true });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Sube un buffer a Cloudinary y devuelve la URL pública
exports.uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'catalogo' }, (err, result) => (err ? reject(err) : resolve(result.secure_url)))
      .end(buffer);
  });

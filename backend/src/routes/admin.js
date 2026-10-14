const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const authCtl = require('../controllers/auth');
const products = require('../controllers/adminProducts');
const categories = require('../controllers/adminCategories');
const { uploadBuffer } = require('../config/cloudinary');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { error: 'Demasiados intentos, intenta más tarde' } });

router.post(
  '/auth/login',
  loginLimiter,
  body('email').isEmail(),
  body('password').isString().notEmpty(),
  validate,
  authCtl.login
);

const id = param('id').isInt({ min: 1 });
const productRules = (optional) => {
  const o = (c) => (optional ? c.optional() : c);
  return [
    o(body('name').isString().trim().isLength({ min: 1, max: 150 })),
    o(body('price').isFloat({ min: 0 })),
    body('description').optional({ nullable: true }).isString(),
    body('category_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('image_url').optional({ nullable: true }).isString().isLength({ max: 255 }),
    body('images').optional().isArray({ max: 5 }).withMessage('Máximo 5 imágenes'),
    body('images.*').isString().isLength({ min: 1, max: 500 }),
    body('stock').optional().isInt({ min: 0 }),
    body('active').optional().isBoolean().toBoolean(),
  ];
};
const catRules = [body('name').isString().trim().isLength({ min: 1, max: 100 })];

router.use(auth);
router.get('/products', products.list);
router.post('/products', productRules(false), validate, products.create);
router.put('/products/:id', id, productRules(true), validate, products.update);
router.delete('/products/:id', id, validate, products.remove);

router.post('/categories', catRules, validate, categories.create);
router.put('/categories/:id', id, catRules, validate, categories.update);
router.delete('/categories/:id', id, validate, categories.remove);

router.post('/upload', upload.array('images', 5), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'Imágenes requeridas' });
  try {
    const urls = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer)));
    res.status(201).json({ urls });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'No se pudieron subir las imágenes' });
  }
});

module.exports = router;


const router = require('express').Router();
const products = require('../controllers/products');
const categories = require('../controllers/categories');

router.get('/products', products.list);
router.get('/products/:id', products.getOne);
router.get('/products/:id/related', products.related);
router.get('/categories', categories.list);

module.exports = router;

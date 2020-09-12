const express = require('express');
const { body } = require('express-validator');

const homeController = require('../controllers/HomeController');
const productController = require('../controllers/ProductController');
const isAuthMiddleware = require('../middleware/is-auth');

const router = express.Router();

router.get("/", homeController.homeCtrl);
router.get("/products", productController.productsList);

router.get("/products/add", isAuthMiddleware, productController.add);
router.post("/products/add", [
    isAuthMiddleware,
    body('title').not().isEmpty().withMessage('Product Title required'),
    body('price').not().isEmpty().isNumeric().withMessage('Numeric product price is required'),
    body('description').not().isEmpty().withMessage('Description is required')
], productController.add);
router.get("/products/:id", productController.getProduct);
router.get("/products/edit/:id", isAuthMiddleware, productController.editProduct);
router.post("/products/edit/:id", [
    isAuthMiddleware,
    body('title').not().isEmpty().withMessage('Product Title required'),
    body('price').not().isEmpty().isNumeric().withMessage('Numeric product price is required'),
    body('description').not().isEmpty().withMessage('Description is required')
], productController.editProduct);
router.post("/products/delete/:id", isAuthMiddleware, productController.delete);


module.exports = router;


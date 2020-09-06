const express = require('express');

const homeController = require('../controllers/HomeController');
const productController = require('../controllers/ProductController');
const isAuthMiddleware = require('../middleware/is-auth');

const router = express.Router();

router.get("/", homeController.homeCtrl);
router.get("/products", productController.productsList);

router.get("/products/add", isAuthMiddleware, productController.add);
router.post("/products/add", isAuthMiddleware, productController.add);
router.get("/products/:id", productController.getProduct);
router.get("/products/edit/:id", isAuthMiddleware, productController.editProduct);
router.post("/products/edit/:id", isAuthMiddleware, productController.editProduct);
router.post("/products/delete/:id", isAuthMiddleware, productController.delete);


module.exports = router;


const express = require('express');

const homeController = require('../controllers/HomeController');
const productController = require('../controllers/ProductController');
const router = express.Router();

router.get("/", homeController.homeCtrl);
router.get("/products", productController.productsList);

router.get("/products/add", productController.add);
router.post("/products/add", productController.add);
router.get("/products/:id", productController.getProduct);
router.get("/products/edit/:id", productController.editProduct);
router.post("/products/edit/:id", productController.editProduct);
router.post("/products/delete/:id", productController.delete);


module.exports = router;


import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authmiddleware.js";
import { braintreePaymentController, braintreeTokenController, createProductController, deleteProductController, filterProductController, getProductController, getSinigleProductController, productCategoryController, productCountController, productListController, productPhotoController, searchProductController, similarProductController, updateProductController } from "../controller/productController.js";
import ExpressFormidable from "express-formidable"; // to store photo information
const router = express.Router();

//routes
router.post('/create-product', requireSignIn, isAdmin, ExpressFormidable(), createProductController)
router.get('/get-products', getProductController);
router.get('/get-products/:slug', getSinigleProductController);

//get photo saperatly
router.get('/product-photo/:pid', productPhotoController);
//delete product
router.delete('/delete-product/:pid', requireSignIn, isAdmin, deleteProductController);
//update product
router.put('/update-product/:pid', requireSignIn, isAdmin, ExpressFormidable(), updateProductController);

//filter product
router.post('/product-filter', filterProductController);

//product count
router.get('/product-count', productCountController);

//product per page count
router.get('/product-list/:page', productListController);

//search product
router.get('/search/:keyword', searchProductController);

//similar product
router.get('/related-product/:pid/:cid', similarProductController);

//category wise product
router.get('/product-category/:slug', productCategoryController);

//braintree payment routes

//validate using token
router.get('/braintree/token', braintreeTokenController);

//braintree payment
router.post('/braintree/payment', requireSignIn, braintreePaymentController);


export default router;
import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authmiddleware.js";
import { categoryController, createCategoryController, deleteCategoryController, singleCategoryController, updateCategoryController } from "../controller/categoryController.js";

const router = express.Router();

//routes

//create category route
router.post('/create-category', requireSignIn, isAdmin, createCategoryController);

//update category route
router.put('/update-category/:id', requireSignIn, isAdmin, updateCategoryController);


//get all categories routes
router.get('/get-category', categoryController);

//get single categories routes
router.get('/single-category/:slug', singleCategoryController);

//delete category route
router.delete('/delete-category/:id', requireSignIn, isAdmin, deleteCategoryController);

export default router;
import CategoryModel from "../models/categoryModel.js";
import slugify from "slugify";

//create a new category
export const createCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.send({ message: 'Name is required' });
        }
        //check existing category
        const existingCategory = await CategoryModel.findOne({ name });
        if (existingCategory) {
            return res.status(200).send({
                success: false,
                message: 'Category already exists'
            });
        }
        const category = await new CategoryModel({ name, slug: slugify(name) }).save();
        res.status(201).send({
            success: true,
            message: 'Category created successfully',
            category
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in creating category',
            error
        })
    }
};

//update category
export const updateCategoryController = async (req, res) => {
    try {
        const { category_name } = req.body;
        const { id } = req.params;
        const category = await CategoryModel.findByIdAndUpdate(id, { name: category_name, slug:slugify(category_name) }, { new: true });
        res.status(200).send({
            success: true,
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in updating category',
            error
        })
    }
}

//get all categories
export const categoryController = async (req, res) => {
    try {
        const category = await CategoryModel.find({});
        res.status(200).send({
            success: true,
            message: 'All Categories List fetched successfully',
            category
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting category',
            error
        })
    }
}

//get single category route

export const singleCategoryController = async (req, res) => {
    try {
        const category = await CategoryModel.findOne({slug: req.params.slug});
        res.status(200).send({
            success: true,
            message: 'Single Category List fetched successfully',
            category
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting single category',
            error
        })
    }
}

//delete category route
export const deleteCategoryController = async (req, res) => {
    try {
        const {id} = req.params;
        await CategoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: 'Category deleted successfully',
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while deleting category',
            error
        })
    }
}
import slugify from "slugify";
import productModel from "../models/productModel.js"
import categoryModel from "../models/categoryModel.js"
import orderModel from "../models/orderModel.js";
import fs from 'fs'; // used becuase ExpressFormidable requre this to work
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRIANTREE_MERCHANT_ID,
    publicKey: process.env.BRIANTREE_PUBLIC_KEY,
    privateKey: process.env.BRIANTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;

        //validate
        switch (true) {
            case !name:
                return res.status(401).send({ message: "Name is required" })
            case !description:
                return res.status(401).send({ message: "description is required" })
            case !price:
                return res.status(401).send({ message: "price is required" })
            case !category:
                return res.status(401).send({ message: "category is required" })
            case !quantity:
                return res.status(401).send({ message: "quantity is required" })
            case photo && photo.size > 1000000:
                return res.status(401).send({ message: "photo is required & should be less than 1MB" })
        }
        const product = new productModel({ ...req.fields, slug: slugify(name) })
        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }
        await product.save();
        res.status(201).send({
            success: true,
            message: "Product saved successfully",
            product
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while creating product',
            error
        })
    }
}

//get all products
export const getProductController = async (req, res) => {
    try {
        const products = await productModel.find({}).populate('category').select("-photo").limit(12).sort({ createdAt: -1 })
        //  here we are not fetching photo because it is a heavy resource so create a seprated endpoint for photo and merge it with /get-product
        res.status(200).send({
            success: true,
            totalcount: products.length,
            message: "All Product",
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while fetching all product',
            error
        })
    }
}

//get single products
export const getSinigleProductController = async (req, res) => {
    try {
        const product = await productModel.findOne({ slug: req.params.slug }).select("-photo").populate('category');
        res.status(200).send({
            success: true,
            message: "single Product fetched successfully",
            product
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while fetching the product',
            error
        })
    }
}

//get photo
export const productPhotoController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).select("photo");
        if (product.photo.data) {
            res.set('Content-Type', product.photo.contentType);
            return res.status(200).send(product.photo.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while fetching the photo',
            error
        })
    }
}

//delete product
export const deleteProductController = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo");
        res.status(200).send({
            success: true,
            message: 'Product deleted successfully'
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while deleting the product',
            error
        })
    }
}

//update product
export const updateProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;

        //validate
        switch (true) {
            case !name:
                return res.status(401).send({ message: "Name is required" })
            case !description:
                return res.status(401).send({ message: "description is required" })
            case !price:
                return res.status(401).send({ message: "price is required" })
            case !category:
                return res.status(401).send({ message: "category is required" })
            case !quantity:
                return res.status(401).send({ message: "quantity is required" })
            case photo && photo.size > 1000000:
                return res.status(401).send({ message: "photo is required & should be less than 1MB" })
        }
        const product = await productModel.findByIdAndUpdate(req.params.pid, { ...req.fields, slug: slugify(name) }, { new: true });
        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }
        res.status(201).send({
            success: true,
            message: "Product update successfully",
            product
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while updating the product',
            error
        })
    }
}

//filter products
export const filterProductController = async (req, res) => {
    try {
        const { checked, radio } = req.body;
        let args = {};
        if (checked.length > 0) args.category = checked;
        if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] }; // here we are storing [0, 999] in term of object which made it in { >=0, <=999}
        const products = await productModel.find(args);
        res.status(200).send({
            success: true,
            message: 'Product filtered successfully',
            products
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while Filtering the product',
            error
        })
    }
}

// product count
export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success: true,
            total
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while counting the product',
            error
        })
    }
}

// product list as per page
export const productListController = async (req, res) => {
    try {
        const perPage = 6;
        const page = req.params.page ? req.params.page : 1;
        const products = await productModel.find({}).select('-photo').skip((page - 1) * perPage).limit(perPage).sort({ createdAt: 'asc' });
        res.status(200).send({
            success: true,
            message: 'Product list fetched successfully',
            products
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in per page counting',
            error
        })
    }
}

// search product
export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const results = await productModel.find({
            // i defines insensitive
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        }).select("-photo");
        res.status(200).send(results);
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: 'Error in product searching',
            error
        });
    }
}

//similar product
export const similarProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const products = await productModel.find({
            category: cid,
            _id: { $ne: pid }
            // ne defines not including
        }).select("-photo").limit(3).populate("category");
        res.status(200).send({
            success: true,
            products
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: 'Error while getting related/similar product',
            error
        });
    }
};

//get product by category
export const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug });
        const products = await productModel.find({ category }).populate("category");
        res.status(200).send({
            success: true,
            category,
            products
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error while getting products"
        });
    }
}

//token
export const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (error, response) {
            if (error) {
                res.status(500).send(error);
            }
            else {
                res.send(response);
            }
        })
    } catch (error) {
        console.log(error);
    }
}

// payment
export const braintreePaymentController = async (req, res) => {
    try {
        const { cart, nonce } = req.body;
        let total = 0;
        cart.map(i => total += i.price);
        console.log(cart);
        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        }, function (error, result) {
            if (result) {
                const order = new orderModel({
                    products: cart,
                    payment: result,
                    buyer: req.user._id
                });
                order.save();
                res.json({ ok: true })
            } else {
                res.status(500).send(error)
            }
        })
    } catch (error) {
        console.log(error);
    }

}
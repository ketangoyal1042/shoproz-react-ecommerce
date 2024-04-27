import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    slug:{
        type:String, 
        lowercase:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    // create a relationship with category
    // provde model of category to link products with category
    category: {
        type:mongoose.ObjectId,
        ref: 'Category',
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    photo:{
        data:Buffer,
        contentType:String
        // photo cant be access direcltly so using one library
        // npm i express-formidable
    },
    shipping:{
        type:Boolean,
    }
}, {timestamps: true})

export default mongoose.model('Products', productSchema);
import JWT  from "jsonwebtoken";
import UserModel from "../models/userModel.js";

//Protected Routes token base
export const requireSignIn = async (req, res, next) =>{

    //validate authnticate user
    try {
    const decode = JWT.verify(req.headers.authorization, process.env.JWT_SECRET);
    // console.log(decode);
    req.user = decode;
    next();
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Encounter Error in Authorization",
            error
        });
    }
}

export const isAdmin = async (req, res, next) =>{
    try {
        const user = await UserModel.findById(req.user._id);
        if (user.role !== 1) {
            return res.send({
                success: false,
                message: "Unauthorized access"
            });
        }
        else{
            next();
        }
    } catch (error) {
        res.status(401).send({
            success: false,
            message: "Error in admin middleware",
            error
        });
    }
}

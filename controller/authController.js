import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import UserModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    if (!name) {
      return res.send({ message: "Name is required" });
    }
    if (!email) {
      return res.send({ message: "email is required" });
    }
    if (!password) {
      return res.send({ message: "password is required" });
    }
    if (!phone) {
      return res.send({ message: "phone is required" });
    }
    if (!address) {
      return res.send({ message: "address is required" });
    }
    if (!answer) {
      return res.send({ message: "answer is required" });
    }

    // validate if it is not an existing user
    const existinguser = await UserModel.findOne({ email }); // can be write email:email
    if (existinguser) {
      return res.status(200).send({
        success: false,
        message: "User already Registered Please Login",
      });
    }

    //make password hash
    const hashedPassword = await hashPassword(password);
    const user = await new UserModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();
    res
      .status(200)
      .send({ success: true, message: "User Registered successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Resgisteration",
      error,
    });
  }
};

export const loginContoller = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    //check user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User does not exist",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Invalid password",
      });
    }
    //token creation
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "Login Successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//forgot password
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, newpassword, answer } = req.body;
    console.log(email, newpassword, answer);
    if (!email) {
      res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "Answer is required" });
    }
    if (!newpassword) {
      res.status(400).send({ message: "New Password is required" });
    }

    //check
    const user = await UserModel.findOne({ email, answer });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Wrong Email or Answer",
      });
    }
    //make password hash
    const hashed = await hashPassword(newpassword);
    await UserModel.findByIdAndUpdate(user._id, { password: hashed });
    res
      .status(200)
      .send({ success: true, message: "Password Reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//update profile

export const updateProfileController = async (req, res) => {
  try {
    const { name, email, address, phone, password } = req.body;
    const user = await UserModel.findById(req.user._id);
    if (password && password.length < 6) {
      res.json({ error: "Password must be at least 6 characters" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        email: email || user.email,
        address: address || user.address,
        phone: phone || user.phone,
        password: hashedPassword || user.password,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while updating profile",
      error,
    });
  }
};

//orders
export const getOrderController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.status(200).send({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};

//all orders
export const getAllOrderController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .populate("buyer", "name")
        .sort({createdAt: "-1"});
      res.status(200).send({
        success: true,
        orders,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error while getting orders",
        error,
      });
    }
  };

export const testController = (req, res) => {
  console.log("Protected Route");
  res.status(200).send("Protected Route");
};


// order status

export const orderStatusController = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {status} = req.body;
        const orders = await orderModel.findByIdAndUpdate(orderId, {status}, {new:true});
        res.status(200).send({
            success:true,
            orders,
            message: "Order Status Updated Successfully",
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message: "Error while updating status",
            error
        })
    }
}
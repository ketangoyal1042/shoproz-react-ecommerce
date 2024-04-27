import express from 'express';
import {registerController, loginContoller, forgotPasswordController, testController, updateProfileController, getOrderController, getAllOrderController, orderStatusController} from '../controller/authController.js'
import { isAdmin, requireSignIn } from '../middlewares/authmiddleware.js';
// router object
const router = express.Router();


//routing

// REGISTER || POST

//need to wirte call function in 2nd arg. usally but using MVC here to doing seprate in controller

// {
//     "name":"Ketan Goyal",
//     "email":"ketangoyal1042@gmail.com",
//     "phone": "9414710098",
//     "password": "qwerty",
//     "address": "Baseri"
// }
router.post('/register', registerController);


//LOGIN || POST
router.post('/login', loginContoller);

//LOGIN || POST
router.post('/forgot-password', forgotPasswordController);


//TEST ROUTES
router.get('/test', requireSignIn ,isAdmin ,testController);

//protected routes for normal authentication
router.get('/user-auth', requireSignIn, (req,res)=>{
    res.status(200).send({ok: true});
});

//protected routes for Admin authentication
router.get('/admin-auth', requireSignIn, isAdmin, (req,res)=>{
    res.status(200).send({ok: true});
});

//update profile
router.put('/update-profile', requireSignIn, updateProfileController);

//product orders
router.get('/orders', requireSignIn, getOrderController);

//All orders
router.get('/all-orders', requireSignIn, isAdmin, getAllOrderController);

//Order Status Update
router.put('/order-status/:orderId', requireSignIn, isAdmin, orderStatusController)

export default router;
const express=require("express");
const {Login,forgotPassword,logout,getMe}=require("../controllers/loginController.js");
const User=require("../models/User_Schema.js");
const bcrypt=require("bcryptjs");
const authMiddleware = require("../middleware/auth_Middleware.js");

const router=express.Router();

router.post("/login",Login);
router.post("/logout",logout);
router.get("/me",authMiddleware,getMe)

// router.post("/forgot-password", forgotPassword);

// //Create User First
// router.post("/create-user", async (req, res) => {
//   const { name, email, role } = req.body;

//   const tempPassword = "temp123";
//   const hashed = await bcrypt.hash(tempPassword, 10);

//   const user = await User.create({
//     name,
//     email,
//     password: hashed,
//     role
//   });

//   res.json({
//     message: "User created",
//     email,
//     tempPassword
//   });
// });


module.exports=router;
const jwt=require("jsonwebtoken");
const cookies=require("cookie-parser");
const User = require("../models/User_Schema.js");

const authMiddleware= async(req,res,next)=>{
    //const token=req.header("Authorization");
    const token=req.cookies.token;
    // if(!token){
    //     return res.status(400).json({message:"No token provided"});
    // }
    if (!token) {
      req.user = null;
      return next(); 
    }
    try{
        const decode=jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findById(decode.id).populate("role");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user=user;
        next();
    }
    catch{
        return res.status(401).json({message:"Invalid Token"});
    }
};

module.exports=authMiddleware;
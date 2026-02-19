const jwt=require("jsonwebtoken");
const cookies=require("cookie-parser");

const authMiddleware=(req,res,next)=>{
    //const token=req.header("Authorization");
    const token=req.cookies.token;
    if(!token){
        return res.status(400).json({message:"No token provided"});
    }
    try{
        const decode=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decode;
        next();
    }
    catch{
        return res.status(401).json({message:"Invalid Token"});
    }
};

module.exports=authMiddleware;
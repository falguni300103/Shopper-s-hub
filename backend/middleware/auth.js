const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt=require("jsonwebtoken");
const User=require("../models/userModel")



exports.isAuthenticatedUser=catchAsyncErrors(async(req,res,next)=>{
    const token=req.cookies.token;

    if(!token){
        return next(new ErrorHandler("Please login to access this resource",401));
    }

    //agr token hai to user ka data le ao
    const decodedData=jwt.verify(token,process.env.JWT_SECRET)

    //ab upar jo data mila usmein se id leke user ko database mein find kro
    req.user=await User.findById(decodedData.id);


    console.log("Mini Login details : ", token, " ", decodedData, " ", req.user);

    next();
})

exports.authorizeRoles=(...roles)=>{
    return (req,res,next)=>{

        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`,403)
            )
        };

        next();
    }
}
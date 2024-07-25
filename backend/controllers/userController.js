const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors=require("../middleware/catchAsyncErrors")
const User=require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail");
const cloudinary=require("cloudinary");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    var Public_id = "";
    var Url = "";
    
    try{
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder: "avatars",
        width:150,
        crop:"scale"
    });
    Public_id = myCloud.public_id;
    Url = myCloud.secure_url;
    }
    catch(error){
        console.log(error);
    }
 
    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:Public_id,
            url:Url
        },
        role : req.body.role ? req.body.role : "user"
    });
    sendToken(user,201,res);
  });

//Login User

exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;

    //checking if user has given password and email

    if(!email || !password){
        return next(new ErrorHandler("Please enter email & password",400
        ));
    }

        //if milgya to user ko database mein find kro
        const user=await User.findOne({email}).select("+password");

        if(!user){
            return next(new ErrorHandler("Invalid email or password",401
        ));
        }

        const isPasswordMatched=await user.comparePassword(password);

        if(!isPasswordMatched){
            return next(new ErrorHandler("Invalid email or password",401))
        }


   sendToken(user,200,res)
})

//logout user

exports.logoutUser=catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        succes:true,
        message:"Logged Out",
    })
})

// //Forgot Password

// exports.forgotPassword=catchAsyncErrors(async(req,res,next)=>{
//     const user=await User.findOne({email:req.body.email});

//     if(!user){
//         return next(new ErrorHandler("User not found",404));
//     }

//     //Get ResetPassword Token
//     const resetToken=user.getResetPasswordToken();

//     await user.save({validateBeforeSave:false});

//     const resetPasswordUrl=`${req.protocol}://${req.get("host")}/password/reset/${resetToken}`

//     const message=`Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then , please ignore it`;

//     try{

//         await sendEmail({
//             email:user.email,
//             subject:`Ecommerce Password recovery`,
//             message,
//         });

//         res.status(200).json({
//             succes:true,
//             message:`Email sent to ${user.email} successfully`,
//         })

//     }catch(error){
//         user.resetPasswordToken=undefined;
//         user.resetPasswordExpire=undefined;

//         await user.save({validateBeforeSave:false});

//         return next(new ErrorHandler(error.message,500));
//     }
// })


//Get user details(user)
exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.user.id);//ye url k sath bhejenge

    res.status(200).json({
        succes:true,
        user,
    })
})

//Update user password
exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.user.id).select("+password");//password k sath user ko find kro

    const isPasswordMatched=await user.comparePassword(req.body.oldPassword);//jo user ne dala pass abhi aur pehle se stored pass same hai kya

        if(!isPasswordMatched){
            return next(new ErrorHandler("Old password is incorrect",400))
        }

        if(req.body.newPassword!==req.body.confirmPassword){
            return next(new ErrorHandler("password does not match",400));
        }

        user.password=req.body.newPassword;//pass update

        await user.save()

       sendToken(user,200,res);//new pass ka token generate krk save krlo cookie mein

})

//Update user profile

exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{

    const newData = {
        name: req.body.name,
        email: req.body.email
    };  
    if(req.body.avatar !== "abc"){
      //  console.log("still got here")
        const user = await User.findById(req.user.id); 
        const imageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder: "avatars",
            width:150,
            crop:"scale"
        });
        
        newData.avatar = {
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    }

    const temp = await User.findByIdAndUpdate(req.user.id,newData,{
        new : true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true
    });
})

//get all users(admin)
exports.getAllUser=catchAsyncErrors(async(req,res,next)=>{
    const users=await User.find();

    res.status(200).json({
        success:true,
        users,
    })
})


//get single user (admin)
exports.getSingleUser=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.params.id);

        if(!user){
            return next(new ErrorHandler(`User does not exist with id ${req.params.id}`))
        }

    res.status(200).json({
        success:true,
        user
    })
})

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };
  
    await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
    });
  });
  
  // Delete User --Admin
  exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
  
    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }

    const imageId=user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);
  
    await User.findByIdAndDelete(req.params.id);

  
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });

})

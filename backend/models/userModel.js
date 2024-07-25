const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken")
const crypto=require("crypto");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Your Name"],
        maxLength:[30,"Name cannot exceed 30 characters"],
        minLength:[4,"Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a Valid Email"]
    },
    password:{
        type:String,
        required:[true,"Please Enter Your Password"],
        minLength:[8,"Password should be greater than 8 characters"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
        },
        url:{
            type:String,
        },
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
})

//schema save hone se pehle ye call ho
userSchema.pre("save",async function(next){

    //agr saari details update hue except password to dobara hash mat kro
    if(!this.isModified("password")){
        next();
    }

    this.password=await bcrypt.hash(this.password,10)//10 is power of hash function
})

//JWT Token
userSchema.methods.getJWTToken=function(){  //sign krk bhejre for authentication
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

//Compare Password
userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

userSchema.methods.getResetPasswordToken=function() {
    //generating token
    const resetToken=crypto.randomBytes(20).toString("hex");

    //hashing and adding resetpasswordtoken to userschema
    this.resetPasswordToken=crypto.
    createHash("sha256").
    update(resetToken).digest("hex");

    this.resetPasswordExpire=Date.now()+15*60*1000;

    return resetToken;
}

module.exports=mongoose.model("User",userSchema)
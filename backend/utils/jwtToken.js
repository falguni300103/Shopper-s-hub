//creating token and saving in cookie

const sendToken=(user,statusCode,res)=>{
    const token=user.getJWTToken();

    //options for cookie
    const oneDay= 1000*60*60*1000;
    const options={
        expires: new Date(
            Date.now() + oneDay),
        httpOnly:true,
    };
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        user,
        token,
    });
}; 

module.exports=sendToken;
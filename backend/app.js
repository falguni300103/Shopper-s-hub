const express=require("express")
const app=express();
const errorMiddleware=require("./middleware/error")
const cookieParser=require("cookie-parser")
const bodyParser=require("body-parser");
const fileUpload=require("express-fileupload");
const dotenv=require("dotenv");
const path=require("path");

//config

dotenv.config({path:"backend/config/config.env"});


app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());
app.use(express.static(path.join(__dirname,'../frontend/build')))

//Routes import
const product=require("./routes/productRoute");
const user=require("./routes/userRoute");
const order=require("./routes/orderRoute")
const payment=require("./routes/paymentRoute")

console.log("products call reacherd here");
app.use("/api/v1",product)
app.use("/api/v1",user)
app.use("/api/v1",order)
app.use("/api/v1",payment)

app.get('*',function(req,res){
    res.sendFile(path.join(__dirname,"../frontend/build/index.html"))
})

//Middleware for errors

app.use(errorMiddleware);


module.exports=app
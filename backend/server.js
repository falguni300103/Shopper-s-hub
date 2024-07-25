const app=require("./app")
const cloudinary=require("cloudinary").v2

const dotenv=require("dotenv");//This imports the dotenv module, which loads environment variables from a .env file into process.env.
const connectDatabase=require("./config/database")

//handling uncaught exception
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
})

//config

dotenv.config({path:"backend/config/config.env"});//config ka sara data kis file mein hai wo btara usse process mein save hojayega
connectDatabase()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

const server=app.listen(process.env.PORT,()=>{//starts express server 
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})


//unhandled promise rejection(agr server ka path glt hai like mongodb k jagah mongo hai)
process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`)

    server.close(()=>{
        process.exit(1);
    })
})
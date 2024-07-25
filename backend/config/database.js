const mongoose=require("mongoose");//node js library to use mongo db

const connectDatabase=()=>{
    mongoose.connect(process.env.DB_URI).then((data)=>{//connect() returns promise , .then resolves the promise 
        console.log(`Mongodb is connected with server :${data.connection.host}`)
    })
}

module.exports=connectDatabase

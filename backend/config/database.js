const mongoose=require("mongoose");//node js library to use mongo db

const connectDatabase=()=>{
    mongoose.connect(mongodb+srv://falguni300103:mini271017@shoppershub.d3wng.mongodb.net/?retryWrites=true&w=majority&appName=ShoppersHub").then((data)=>{//connect() returns promise , .then resolves the promise 
        console.log(`Mongodb is connected with server :${data.connection.host}`)
    })
}

module.exports=connectDatabase

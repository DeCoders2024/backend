const mongoose=require("mongoose")

const connect=()=>{
    mongoose.connect(process.env.DB_STRING,()=>{
        console.log("Connect With dataBase")
    })
}

module.exports=connect;
const mongoose=require("mongoose")
const sessionModel=new mongoose.Schema({
        user_id:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
        },
        user_ip:{
            type:String,
            required:true
        },
        date_time:{
            type:Date,
            default:Date.now
        }
})

module.exports=mongoose.model("Session",sessionModel)

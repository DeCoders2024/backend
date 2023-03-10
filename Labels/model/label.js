const mongoose=require("mongoose")
const schema=mongoose.Schema
const labelModel=new mongoose.Schema({
        user_id:{
            type:schema.Types.ObjectId,
            require:true
        },
        label_name:{
            type:String,
            required:true,
        },
        label_server_name:{
            type:String,
            require:true
        },
        label_add_date:{
            type:Date,
            default:Date.now
        },
        label_access_link:{
            type:String,
            default:""
        },
        access_all:{
            type:Boolean,
            default:true
        }
})


module.exports=mongoose.model("Labels",labelModel);

const mongoose=require("mongoose")
const schema=mongoose.Schema
const accessModel=new mongoose.Schema({
        label_id:{
            type:schema.Types.ObjectId,
            require:true
        },
        owner:{
            type:schema.Types.ObjectId,
            required:true,
        },
        access_by:{
            type:String,
            require:true
        },
        isAccessAll:{
            type:Boolean,
            required:true,
            default:false
        },
        access_add_date:{
            type:Date,
            default:Date.now
        }
})


module.exports=mongoose.model("Access",accessModel);

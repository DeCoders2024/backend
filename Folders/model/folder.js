const mongoose=require("mongoose")
const schema=mongoose.Schema
const folderModel=new mongoose.Schema({
        user_id:{
            type:schema.Types.ObjectId,
            require:true
        },
        folder_name:{
            type:String,
            required:true,
        },
        folder_server_name:{
            type:String,
            require:true
        },
        folder_parent:{
            type:schema.Types.ObjectId,
            default:null
        },
        folder_type:{
            type:Number,
            required:true,
        },
        folder_logo:{
            type:String,
            default:""
        },
        folder_extention:{
            type:String,
            default:""
        },
        folder_add_date:{
            type:Date,
            default:Date.now
        },
        folder_access_link:{
            type:String,
            default:""
        },
        access_all:{
            type:Boolean,
            default:false
        },
        space:{
            type:String,
            require:true,
            default:0
        }
})


module.exports=mongoose.model("Folders",folderModel);

const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const userModel=new mongoose.Schema({
        name:{
            type:String,
            required:true,
        },
        emailid:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true,
        },
        access_token:{
            type:String,
            default:""
        },
        reset_token:{
            type:String,
            default:""
        },
        profile_pic:{
            type:String,
            default:""
        }
})

userModel.methods.encryptPassword=function(){
    let salt=bcrypt.genSaltSync();
    this.password=bcrypt.hashSync(this.password,salt);
}

userModel.methods.getToken=function(){
    let token= jwt.sign({id:this._id},process.env.SECRET_KEY,{
        expiresIn : process.env.JWT_EXPIRE 
    })
    this.access_token=token;
    return token;
}

userModel.methods.compareToken=function(token){
    return(this.access_token===token);
}

userModel.methods.comparePassword=function(password){
        return (
            bcrypt.compareSync(password,this.password)
        )
}



module.exports=mongoose.model("User",userModel)

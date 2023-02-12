const userModel=require("../model/user")
const path=require("path")
const { removeSession,saveIp } = require("../../middleware/IP")
const root_dir=path.dirname(path.dirname(__dirname))
const removeFile=require(`${root_dir}/middleware/removeFile`)
const AddUser=async(req,res,next)=>{
    try{
        let {emailid,name,password}=req.body;
        if(await userModel.findOne({emailid})){
            return res.status(403).json({status:false,"error":"Email Id Already Exist"})
        }
        let user=await userModel({emailid,name,password})
        user.encryptPassword();
        let token=user.getToken()
        let t=await user.save()
        t=await saveIp(req,user._id)
        return res.status(200).json({status:true,token});
    }
    catch(e){
        console.log(e)
        return res.status(500).json({status:false,error:"Server Error..."})
    }
}

const login=async(req,res,next)=>{
    try{
        
        let {emailid,password}=req.body;
        let user=await userModel.findOne({emailid})
        if(!user){
            return res.status(401).json({status:false,error:"Invalid User"})
        }
        if(!user.comparePassword(password)){
            return res.status(401).json({status:false,error:"Invalid User"})
        }
        let token=user.getToken()
        let t=await user.save()
        t=await saveIp(req,user._id)
        return res.status(200).json({status:true,token});
    }
    catch(e){
        console.log(e)
        return res.status(500).json({status:false,error:"Server Error..."})
    }
}

const updateProfile=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let {filename}=req.body;
        let user=await userModel.findById(_id)
        removeFile(`user_images/${user.profile_pic}`)
        user.profile_pic=`${filename}`;
        await user.save()
        return res.status(200).json({status:true})
    }
    catch(e){
        console.log(e)
        return res.status(500).json({status:false,error:"Server Error..."});
    }   
}

const updateUser=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let {profile_pic,name}=req.body;
        let user=await userModel.findById(_id)
        if(profile_pic){
            removeFile(`user_images/${user.profile_pic}`)
            user.profile_pic=profile_pic;
        }
        if(name){
            user.name=name;
        }
            await user.save()
        return res.status(200).json({status:true})
    }
    catch(e){
        console.log(e)
        return res.status(500).json({status:false,error:"Server Error..."});
    } 
}
const getUser=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let user=await userModel.findById(_id).select(["-password","-reset_token","-access_token","-_id","-__v"])
        return res.status(200).json({status:true,user})
    }
    catch(e){
        console.log(e)
        return res.status(500).json({status:false,error:"Server Error..."});
    }   
}

const updatePassword=async(req,res,next)=>{

}

const Logout=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let user=await userModel.findById(_id);
        user.access_token=""
        await user.save()
        res.clearCookie("token");
        let t=await removeSession(req)
        return res.status(200).json({status:true})
    }
    catch(e){
        return res.status(500).json({status:false,error:"Server Error...."})
    }
}

const getUserImage=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let folder=await userModel.findById(_id)
        var filename="user_files/!pka!95tw@.png"
        if(!folder){
          return res.sendFile(`${root_dir}/Files/${filename}`)
        }
        else{
          return res.sendFile(`${root_dir}/Files/user_images/${folder.profile_pic}`)
        }
    }
  catch(e){
    console.log(e)
     return res.sendFile(`${root_dir}/Files/user_files/!pka!95tw@.png`)
  }
}

module.exports={AddUser,login,updateProfile,getUser,Logout,updateUser,getUserImage}
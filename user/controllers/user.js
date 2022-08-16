const userModel=require("../model/user")

const AddUser=async(req,res,next)=>{
    try{
        let {emailid,name,password}=req.body;
        if(await userModel.findOne({emailid})){
            return res.status(403).json({status:false,"error":"Email Id Already Exist"})
        }
        let user=await userModel({emailid,name,password})
        user.encryptPassword();
        let token=user.getToken()
        await user.save()
        return res.status(200).cookie("token",token,{maxAge:24*60*60*1000}).json({status:true,token});
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
        await user.save()
        return res.status(200).cookie("token",token,{maxAge:24*60*60*1000}).json({status:true,token});
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
        if(String(user.profile_pic).startsWith(process.env.BACKEND_URL)){
            let fd=String(user.profile_pic).split("/")
            removeFile(`user_images/${fd[fd.length-1]}`)
        }
        user.profile_pic=`${process.env.BACKEND_URL}/accessFile/${filename}`;
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

            if(String(user.profile_pic).startsWith(process.env.BACKEND_URL)){
                let fd=String(user.profile_pic).split("/")
                removeFile(`user_images/${fd[fd.length-1]}`)
            }
            user.profile_pic=`${process.env.BACKEND_URL}/accessFile/${filename}`;
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
        return res.status(200).json({status:true})
    }
    catch(e){
        return res.status(500).json({status:false,error:"Server Error...."})
    }
}

module.exports={AddUser,login,updateProfile,getUser,Logout,updateUser}
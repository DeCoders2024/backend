const jwt=require("jsonwebtoken")
const userModel=require("../user/model/user")
const verifyToken=async(req,res,next)=>{
    try{
        let {token}=req.cookies;
        let data=jwt.verify(token,process.env.SECRET_KEY);
        let user=await userModel.findById(data.id);
        if(user.compareToken(token)){
            req.params['_id']=data.id;
            next();
        }
        else{
            throw Error("Invalid User")
        }

    }
    catch(e){
        console.log(e)
        return res.status(401).json({status:false,error:"Invalid User"})
    }
}

module.exports=verifyToken;
const sessionModel=require("../user/model/session")
const requestIp = require('request-ip');
const jwt=require("jsonwebtoken")
const userModel=require("../user/model/user")
async function saveIp(req,user_id){
    try{
        let user_ip=requestIp.getClientIp(req);
        let sessions=await sessionModel.deleteMany({user_id});
        let session=await sessionModel.create({user_id,user_ip});
        console.log("Save Session")
        return true;
    }
    catch(e){
        console.log(e)
        return false;
    }

}

async function removeSession(req){
    try{
        let user_ip=requestIp.getClientIp(req);
        let session=await sessionModel.deleteOne({user_ip});
        return true;
    }
    catch(e){
        console.log(e)
        return false;
    }
}

const verifyIp=async(req,res,next)=>{
    try{
        let user_ip=requestIp.getClientIp(req);
        let session=await sessionModel.findOne({user_ip});
        if(!session){
            console.log("I am Here")
            return res.status(401).json({"status":false,"error":"Session Expired"})
        }
        let user_id=session.user_id;
        let user=await userModel.findById(user_id);
        if(!user){
            return res.status(401).json({"status":false,"error":"Invalid User"})
        }
        let token=user.access_token;
        if(jwt.decode(token,process.env.SECRET_KEY)){
            req.body['token']=token
            // console.log(token)
            return next()
        }
        else{
            return res.status(401).json({"status":false,"error":"Session Expired"})
        }
    }
    catch(e){
        console.log(e)
        return res.status(401).json({"status":false,"error":"Session Expired"})
    }
}

module.exports={saveIp,verifyIp,removeSession};
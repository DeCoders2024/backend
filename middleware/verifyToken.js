const jwt=require("jsonwebtoken")
const userModel=require("../user/model/user") 
const requestIp = require('request-ip');
const sessionModel=require("../user/model/session")
const verifyToken=async(req,res,next)=>{
    try{
        var {token}=req.headers;
      if(!token){
        token=req.cookies.token;
      }
      if(!token){
        token=req.body.token;
      }
      if(!token){
          token=req.query.tk;
      }
        let data=jwt.verify(token,process.env.SECRET_KEY);
        let user=await userModel.findById(data.id);
        if(user.compareToken(token)){
            let ip=requestIp.getClientIp(req)
            let session=await sessionModel.findOne({user_id:data.id,user_ip:ip});
            if(!session){
              return res.status(401).json({"status":false,"error":"Session Expired"});
            }
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
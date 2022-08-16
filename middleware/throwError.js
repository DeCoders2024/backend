const error=(res,status,msg)=>{
    return res.status(status).json({status:false,error:msg})
}

module.exports=error;
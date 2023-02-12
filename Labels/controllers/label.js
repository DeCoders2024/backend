const path=require("path")
const labelModel=require("../model/label")
const uid=require("generate-unique-id")
const root_dir=path.dirname(path.dirname(__dirname))
const userModel=require(`${root_dir}/user/model/user`)
const error=require(`${root_dir}/middleware/throwError`)
const removeFile=require(`${root_dir}/middleware/removeFile`)
const sessionModel=require("../../user/model/session")
const accessModel=require("../model/access")
const requestIp=require("request-ip")
const jwt=require("jsonwebtoken")
const fs=require("fs")
const { default: axios } = require("axios")
const createLabel=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let {label_name,label_server_name}=req.body;
        let label_access_link=`${label_server_name}`
        label=await labelModel({label_name:`${label_name}@${new Date().toISOString()}`,user_id:_id,label_access_link,label_server_name})
        await label.save()
        return res.status(200).json({status:true,label_id:label._id})        
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const getAlllabels=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let labels=await labelModel.find({user_id:_id})
        return res.status(200).json({status:true,labels})
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}


const updatelabel=async(req,res,next)=>{
    try{
        let {_id,label_id}=req.params;
        let {label_name,access_all}=req.body;
        let label=await labelModel.findOne({_id:label_id,user_id:_id});
        if(!label){
            return res.status(401).json({"status":false,error:"Invalid label"})
        }
        if(label_name){
            label_name=String(label_name)+`@${new Date().toISOString()}`
            label.label_name=label_name
        }
        if(label_content){
            label.label_content=label_content;
        }
        if(access_all===true || access_all===false){
            if(!access_all){
                let access=await accessModel.deleteMany({owner:_id,label_id:label._id});
            }
            label.access_all=access_all;
        }
        await label.save();
        return res.status(200).json({status:true})
    }
    catch(e){
        console.log(e)
        return error(res,500,"Server Error....")
    }
}

const addPersonToAccess=async(req,res,next)=>{
    try{
        let {_id,label_id}=req.params;
        let {emailid}=req.query;
        let user=await userModel.findOne({emailid});
        
        if(!user || user._id==_id){
            return res.status(404).json({"status":false,error:"Email Id not exist or its your Email id"});
        }
        let label=await labelModel.findOne({_id:label_id,user_id:_id});
        if(!label){
            return res.status(401).json({status:false,error:"Invalid User"})
        }
        let access=await accessModel.findOne({label_id,access_by:emailid,owner:_id});
        if(access){
            return res.status(400).json({status:false,error:"Person Already Have label Access"})
        }
        access=await accessModel.create({label_id,access_by:emailid,owner:_id});
        return res.status(200).json({status:true,access_id:access._id,emailid})
    }
    catch(e){
        console.log("error",e)
        error(res,500,"Server Error....")
    }
}

const removeAccess=async(req,res,next)=>{
    try{
        let {_id,access_id}=req.params;
        let user=await userModel.findById(_id)
        let obj={}
        if(req.query.state){
            obj['access_by']=user.emailid
            obj['label_id']=access_id
        }
        else{
            obj['owner']=_id
            obj['_id']=access_id
        }
        let access=await accessModel.findOne(obj)
        if(!access){
            return res.status(401).json({'status':false,error:"Invalid User"})
        }
        access=await accessModel.deleteOne({_id:access._id});
        return res.status(200).json({status:true});
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const getAccess=async(req,res,next)=>{
    try{
        let {_id,label_id}=req.params;
        let label=await labelModel.findOne({user_id:_id,_id:label_id})
        if(!label){
            return res.status(401).json({status:false,error:"Invalid User"})
        }
        let access=await accessModel.find({owner:_id,label_id:label_id})
        return res.status(200).json({status:true,data:access});
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}


const deletelabel=async(req,res,next)=>{
    try{
        let {_id,label_id}=req.params;
        let label=await labelModel.findOne({user_id:_id,_id:label_id})
        
        if(!label){
            return error(res,404,"Invalid label")
        }
        await labelModel.deleteOne({_id:label._id})
        let result=await axios.post(process.env.ML_URL+"/delete/label",{"file_name":label.label_server_name,"key":process.env.SECRET_KEY},{
            headers:{"content-type":"application/json"}
        }) 
        return res.status(200).json({status:true,label_delete})

    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}



module.exports={getAccess,createLabel,getAlllabels,updatelabel,addPersonToAccess,removeAccess,deletelabel}
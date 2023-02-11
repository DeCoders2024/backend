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
const createLabel=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let {label_name,label_parent}=req.body;
        let label_type=1
        if(label_parent===undefined){
            label_parent=null;
        }
        else{
            var label=await labelModel.findOne({_id:label_parent,user_id:_id})
            if(!label || label.label_type===0){
                return res.status(401).json({status:false,error:"Invalid Parent label"})
            }
        }
        var label=await labelModel.findOne({label_type:1,label_name,user_id:_id,label_parent})
        if(label){
                return res.status(400).json({"status":false,error:"Duplicate Sub Label"})
            }
        let label_server_name=uid({
            length:10,
            includeSymbols:['@','$','!','^','&']
        })
        let label_access_link=`${label_server_name}`
        label=await labelModel({label_name,label_type,label_parent,user_id:_id,label_access_link,label_server_name})
        await label.save()
        return res.status(200).json({status:true,label_id:label._id})        
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const addNote=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let {label_parent,label_content,label_name}=req.body;
        if(label_parent===undefined){
            label_parent=null;
        }
        else{
            var label=await labelModel.findOne({_id:label_parent,user_id:_id})
            if(!label || label.label_type===0){
                return res.status(401).json({status:false,error:"Invalid Parent label"})
            }
        }
        var label=await labelModel.findOne({_id:label_parent,user_id:_id,label_name,label_type:0});
        if(label){
            return res.status(400).json({status:false,error:"Duplicate Note Name"})
        }
        let label_server_name=uid({
            length:10,
            includeSymbols:['@','$','!','^','&']
        })
        let label_access_link=`${label_server_name}`
        label=await labelModel({label_name,label_type:0,label_parent,user_id:_id,label_access_link,label_server_name,label_content})
        await label.save()
        return res.status(200).json({status:true,file_ids})
    }
    catch(e){
        console.log(e)
        error(res,500,"Invalid Parent label")   
    }
}

const getAlllabels=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let labels=await labelModel.find({user_id:_id,...req.query})
        return res.status(200).json({status:true,labels})
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const updatelabelLogo=async(req,res,next)=>{
    try{
        let {_id,label_id}=req.params;
        let {filename}=req.body;
        let label=await labelModel.findOne({_id:label_id,user_id:_id});
        if(!label){
            return res.status(401).json({"status":false,error:"Invalid label"})
        }
        else{
            removeFile(`user_images/${label.label_logo}`)
            label.label_logo=`${filename}`;
        }
        await label.save();
        return res.status(200).json({status:true})
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const updatelabel=async(req,res,next)=>{
    try{
        let {_id,label_id}=req.params;
        let {label_name,label_parent,label_logo,access_all,label_content}=req.body;
        let label=await labelModel.findOne({_id:label_id,user_id:_id});
        if(!label){
            return res.status(401).json({"status":false,error:"Invalid label"})
        }
        if(label_parent==="null"){
          label_parent=null;
        }
        if(label_parent!==undefined && String(label_parent)!==String(label.label_parent)){
        let parent=await labelModel.findOne({_id:label_parent,user_id:_id})
        if(!parent && label_parent!==null){
            return res.status(401).json({"status":false,error:"Parent label Not Exist"})
        }
          else if(label_parent==null){
            let t=await chageSpace(-parseFloat(label.space),label.label_parent)
            t=await chageSpace(parseFloat(label.space),label_parent)
            label.label_parent=label_parent
          }
        else if(label_parent && String(parent._id)===String(label._id)){
            return res.status(400).json({"status":false,error:"Move Command Fail To Do this"})
        }
        
          else{
            
        let duplicate=await labelModel.findOne({label_parent,user_id:_id,label_type:label.label_type,label_name:label_name?label_name:label.label_name})
        if(duplicate){
            return res.status(400).json({status:false,error:"Duplicate label Create"})
        }
        if(label_parent)
        {let isDone=await isMoveable(label._id,parent._id,_id)
        if(!isDone){
            return error(res,400,"The Destination label Is Sub label of source label")
        }}
        let t=await chageSpace(-parseFloat(label.space),label.label_parent)
            t=await chageSpace(parseFloat(label.space),label_parent)
        label.label_parent=label_parent;
          }
    }
        if(label_name){
            label_name=String(label_name)
            if(label_name.indexOf("/")!==-1 || label_name.indexOf("\\")!==-1){
                return res.status(400).json({status:false,error:"label Name Not Valid"})
            }
            label.label_name=label_name
        }
        if(label_content){
            label.label_content=label_content;
        }
        if(label_logo || label_logo===""){
            removeFile(`user_images/${label.label_logo}`)
            label.label_logo=label_logo;
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

const isMoveable=async(node,parent_node,user_id)=>{
    try{
        var labels=[]
        var out=Array.from(await labelModel.find({user_id,_id:node}));
        for(let val of out){
            labels.push(String(val._id))
        }
        while(labels.length!==0){
            if(labels.indexOf(String(parent_node))!==-1){
                    return false;
            } 
            let val=labels[labels.length-1];
            labels.pop();
            var out=Array.from(await labelModel.find({user_id,label_parent:val}));;
            for(let val of out){
                labels.push(String(val._id))
            }
        }
        return true;
    }
    catch(e){
        console.log(e)
        return false;
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

const findUsingPath=async(req,res,next)=>{
      var dirs=[{"label_name":"root:",_id:null}]
    try{
        let dir_path=req.query.path;
        let {_id}=req.params;
        dir_path=String(dir_path).split("/")
        if(dir_path.length===0 || dir_path[0]!=="root:"){
            return res.status(400).json({"status":false,error:"Invalid Directory Path",dirs})
        }
        else{
            var label_parent=null;
            for(let i=1;i<dir_path.length;i++){
                let label_name=dir_path[i];
                if(label_name===""){
                    continue;
                }
                else{
                    let label=await labelModel.findOne({user_id:_id,label_name})
                    if(!label){
                        let labels=await labelModel.find({label_parent,user_id:_id});
                        return res.status(400).json({status:false,error:"Invalid Directory Enter",dirs,labels})
                    }
                    if(label.label_type===0){
                        if(i===dir_path.length-1){
                            return res.status(200).json({status:true,labels:[label],dirs})
                        }
                        else{
                          let labels=await labelModel.find({label_parent,user_id:_id});
                            return res.status(400).json({status:false,error:"Invalid Directory Enter",dirs,labels})
                        }
                    }
                    label_parent=label._id;
                    dirs.push({label_name,_id:label._id})
                }
            }
        }
        let labels=await labelModel.find({label_parent,user_id:_id});
        return res.status(200).json({status:true,labels,dirs})
    }
    catch(e){
        console.log(e)
        return res.status(500).json({status:false,error:"Server Error...",dirs})
    }
}

const findaccessUsingPath=async(req,res,next)=>{
    var dirs=[{"label_name":"root:",_id:null}]
  try{
      let dir_path=req.query.path;
      let label_id=req.query.id
      let {_id}=req.params;
      let user=await userModel.findById(_id);
      dir_path=String(dir_path).split("/")
      if(dir_path.length===0 || dir_path[0]!=="root:"){
          return res.status(400).json({"status":false,error:"Invalid Directory Path",dirs})
      }
      else{
          var label_parent=null;
          for(let i=1;i<dir_path.length;i++){
              let label_name=dir_path[i];
              if(label_name===""){
                  continue;
              }
              else{
                if(i==1){
                    let access=await accessModel.findOne({label_id:label_id,access_by:user.emailid});
                    if(!access){
                        return res.status(401).json({"sttaus":false,"error":"Invalid User"})
                    }
                    _id=access.owner
                    let label=await labelModel.findById(label_id)
                    if(!label){
                        return res.status(401).json({"sttaus":false,"error":"Invalid User"})
                    }
                    label_parent=label.label_parent
                  }
                  let label=await labelModel.findOne({label_name,user_id:_id})
                  if(!label){
                      let labels=await labelModel.find({label_parent,user_id:_id});
                      return res.status(400).json({status:false,error:"Invalid Directory Enter",dirs,labels})
                  }
                  
                  if(label.label_type===0){
                      if(i===dir_path.length-1){
                          return res.status(200).json({status:true,labels:[label],dirs})
                      }
                      else{
                        let labels=await labelModel.find({label_parent,user_id:_id});
                          return res.status(400).json({status:false,error:"Invalid Directory Enter",dirs,labels})
                      }
                  }
                  label_parent=label._id;
                  dirs.push({label_name,_id:label._id})
              }
          }
      }
      if(!label_parent){
            let labelaccess=await accessModel.find({access_by:user.emailid});
            // console.log(labelaccess)
            let labels=[]
            for(let val of labelaccess){
                let label=await labelModel.findById(val.label_id);
                if(label){
                    labels.push(label)
                }
            }
            return res.status(200).json({status:true,labels,dirs});
      }
      else{
          let labels=await labelModel.find({label_parent,user_id:_id});
          return res.status(200).json({status:true,labels,dirs})
    }
  }
  catch(e){
      console.log(e)
      return res.status(500).json({status:false,error:"Server Error...",dirs})
  }
}

const deletelabel=async(req,res,next)=>{
    try{
        let {_id,label_id}=req.params;
        let label=await labelModel.findOne({user_id:_id,_id:label_id})
        
        if(!label){
            return error(res,404,"Invalid label")
        }
        let t=await chageSpace(-parseFloat(label.space),label.label_parent)
        var labels=[label]
        var label_delete=[]
        while(labels.length!==0){
            let label=labels[labels.length-1]
            let res=await labelModel.deleteOne({_id:label._id})
            let access=await accessModel.deleteMany({owner:_id,label_id:label._id});
            if(label.label_type==0){
                removeFile(`user_files/${label.label_server_name}`);
            }
            labels.pop()
            let out=Array.from(await labelModel.find({label_parent:label._id}));
            for(let val of out){
                labels.push(val)
            }
            label_delete.push({_id:label._id,label_name:label.label_name});
        }
        return res.status(200).json({status:true,label_delete})
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const getLogo=async(req,res,next)=>{
    try{
        let {_id,label_logo}=req.params;
        var query={label_logo}
        let label=await labelModel.findOne(query)
        let user=await userModel.findById(_id)
        let access=await accessModel.findOne({label_id:label._id,access_by:user.emailid});
        var filename="labelLogo.png"
        if((access || label.user_id==_id)){
            filename=label.label_logo;
        }
          return res.sendFile(`${root_dir}/Files/user_images/${filename}`)
    }
  catch(e){
    console.log(e)
     return res.sendFile(`${root_dir}/Files/user_images/labelLogo.png`)
  }
}

const addAccessByLink=async(req,res,next)=>{
    try{
        let {label_type,label_access_link}=req.params;
        let label=await labelModel.findOne({label_access_link});
        // console.log(label)
        if(!label){
            return res.status(401).json({status:false,error:"Invalid label Access Link"})
        }
        let user_ip=requestIp.getClientIp(req);
        let session=await sessionModel.findOne({user_ip});
        if(!session){
                return res.redirect(`${process.env.FRONT_END_URL}/login`)
        }
        let user_id=session.user_id;
        let user=await userModel.findById(user_id)
        if(!user){
                return res.redirect(`${process.env.FRONT_END_URL}/login`)
        }
        let token=user.access_token;
        try{
            if(jwt.decode(token,process.env.SECRET_KEY)){
                let access=await accessModel.findOne({label_id:label._id,access_by:user.emailid});
                if(label.access_all && !access){
                    access=await accessModel.create({label_id:label._id,access_by:user.emailid,owner:label.user_id});
                }
                if(access || String(user._id)===String(label.user_id)){
                    return res.redirect(process.env.FRONT_END_URL)
                }
                return res.status(401).json({status:false,error:"Invalid label Access Link"})
            }
            else{
                    return res.redirect(`${process.env.FRONT_END_URL}/login`)

            }
        }
        catch(e){
            console.log(e)
                return res.redirect(`${process.env.FRONT_END_URL}/login`) 
        }
        
    }
    catch(e){
        console.log("error",e)
        error(res,500,"Server Error....")
    }
}




module.exports={getLogo,getAccess,addAccessByLink,findaccessUsingPath,createLabel,getAlllabels,addNote,findUsingPath,updatelabel,updatelabelLogo,addPersonToAccess,removeAccess,deletelabel}
const path=require("path")
const folderModel=require("../model/folder")
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
const downloadFolder=require("../../middleware/downloadFolder")
const createFolder=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let {folder_name,folder_parent}=req.body;
        let folder_type=1
        if(folder_parent===undefined){
            folder_parent=null;
        }
        else{
            var folder=await folderModel.findOne({_id:folder_parent,user_id:_id})
            if(!folder || folder.folder_type===0){
                return res.status(401).json({status:false,error:"Invalid Parent Folder"})
            }
        }
        var folder=await folderModel.findOne({folder_type:1,folder_name,user_id:_id,folder_parent})
        if(folder){
                return res.status(400).json({"status":false,error:"Duplicate Folder In This Directory"})
            }
        let folder_server_name=uid({
            length:10,
            includeSymbols:['@','$','!','^','&']
        })
        let folder_access_link=`${folder_server_name}`
        folder=await folderModel({folder_name,folder_type,folder_parent,user_id:_id,folder_access_link,folder_server_name})
        await folder.save()
        return res.status(200).json({status:true,folder_id:folder._id})        
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const addFile=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let {folder_parent,filename}=req.body;
        if(folder_parent===undefined){
            folder_parent=null;
        }
        else{
            var folder=await folderModel.findOne({_id:folder_parent,user_id:_id})
            if(!folder || folder.folder_type===0){
                return res.status(401).json({status:false,error:"Invalid Parent Folder"})
            }
        }
        let file_ids=[]
        var total_size=0
        for(let i=0;i<filename.length;i++){
            let file=filename[i];
            var folder=await folderModel.findOne({folder_type:0,folder_parent,user_id:_id,folder_name:file.originalname});
            if(!folder){
                let id=uid({
                    length:10,
                    includeSymbols:['@','$','!','^','&']
                })
                let space=Math.round((file.size/(1024*1024))*100)/100;
                folder=await folderModel.create({folder_access_link:id,folder_type:0,folder_name:file.originalname,folder_server_name:file.filename,folder_extention:file.extention,user_id:_id,folder_parent,space})
                total_size+=space;    
            }
            else{
                removeFile(`user_files/${file.filename}`)
            }
            file_ids.push(folder._id)
        }
        let t=await chageSpace(total_size,folder_parent)
        return res.status(200).json({status:true,file_ids})
    }
    catch(e){
        console.log(e)
        error(res,500,"Invalid Parent Folder")   
    }
}
const chageSpace=async(space,folder_parent)=>{
    while(folder_parent!==null){
        let folder=await folderModel.findOne({_id:folder_parent})
        folder.space=parseFloat(folder.space)+space;
        let t=await folder.save()
        folder_parent=folder.folder_parent;
    }
}
const getAllFolders=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let folders=await folderModel.find({user_id:_id,...req.query})
        return res.status(200).json({status:true,folders})
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const updateFolderLogo=async(req,res,next)=>{
    try{
        let {_id,folder_id}=req.params;
        let {filename}=req.body;
        let folder=await folderModel.findOne({_id:folder_id,user_id:_id});
        if(!folder){
            return res.status(401).json({"status":false,error:"Invalid Folder"})
        }
        else{
            removeFile(`user_images/${folder.folder_logo}`)
            folder.folder_logo=`${filename}`;
        }
        await folder.save();
        return res.status(200).json({status:true})
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const updateFolder=async(req,res,next)=>{
    try{
        let {_id,folder_id}=req.params;
        let {folder_name,folder_parent,folder_logo,access_all}=req.body;
        let folder=await folderModel.findOne({_id:folder_id,user_id:_id});
        if(!folder){
            return res.status(401).json({"status":false,error:"Invalid Folder"})
        }
        if(folder_parent==="null"){
          folder_parent=null;
        }
        if(folder_parent!==undefined && String(folder_parent)!==String(folder.folder_parent)){
        let parent=await folderModel.findOne({_id:folder_parent,user_id:_id})
        if(!parent && folder_parent!==null){
            return res.status(401).json({"status":false,error:"Parent Folder Not Exist"})
        }
          else if(folder_parent==null){
            let t=await chageSpace(-parseFloat(folder.space),folder.folder_parent)
            t=await chageSpace(parseFloat(folder.space),folder_parent)
            folder.folder_parent=folder_parent
          }
        else if(folder_parent && String(parent._id)===String(folder._id)){
            return res.status(400).json({"status":false,error:"Move Command Fail To Do this"})
        }
        
          else{
            
        let duplicate=await folderModel.findOne({folder_parent,user_id:_id,folder_type:folder.folder_type,folder_name:folder_name?folder_name:folder.folder_name})
        if(duplicate){
            return res.status(400).json({status:false,error:"Duplicate Folder Create"})
        }
        if(folder_parent)
        {let isDone=await isMoveable(folder._id,parent._id,_id)
        // console.log(isDone)
        if(!isDone){
            return error(res,400,"The Destination Folder Is Sub Folder of source folder")
        }}
        let t=await chageSpace(-parseFloat(folder.space),folder.folder_parent)
            t=await chageSpace(parseFloat(folder.space),folder_parent)
        folder.folder_parent=folder_parent;
          }
    }
        if(folder_name){
            folder_name=String(folder_name)
            if(folder_name.indexOf("/")!==-1 || folder_name.indexOf("\\")!==-1){
                return res.status(400).json({status:false,error:"Folder Name Not Valid"})
            }
            folder.folder_name=folder_name
        }
        if(folder_logo || folder_logo===""){
            removeFile(`user_images/${folder.folder_logo}`)
            folder.folder_logo=folder_logo;
        }
        if(access_all===true || access_all===false){
            if(!access_all){
                let access=await accessModel.deleteMany({owner:_id,folder_id:folder._id});
            }
            folder.access_all=access_all;
        }
        await folder.save();
        return res.status(200).json({status:true})
    }
    catch(e){
        console.log(e)
        return error(res,500,"Server Error....")
    }
}

const isMoveable=async(node,parent_node,user_id)=>{
    try{
        var folders=[]
        var out=Array.from(await folderModel.find({user_id,_id:node}));
        for(let val of out){
            folders.push(String(val._id))
        }
        while(folders.length!==0){
            if(folders.indexOf(String(parent_node))!==-1){
                    return false;
            } 
            let val=folders[folders.length-1];
            folders.pop();
            var out=Array.from(await folderModel.find({user_id,folder_parent:val}));;
            for(let val of out){
                folders.push(String(val._id))
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
        let {_id,folder_id}=req.params;
        let {emailid}=req.query;
        let user=await userModel.findOne({emailid});
        
        if(!user || user._id==_id){
            return res.status(404).json({"status":false,error:"Email Id not exist or its your Email id"});
        }
        let folder=await folderModel.findOne({_id:folder_id,user_id:_id});
        if(!folder){
            return res.status(401).json({status:false,error:"Invalid User"})
        }
        let access=await accessModel.findOne({folder_id,access_by:emailid,owner:_id});
        if(access){
            return res.status(400).json({status:false,error:"Person Already Have Folder Access"})
        }
        access=await accessModel.create({folder_id,access_by:emailid,owner:_id});
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
            obj['folder_id']=access_id
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
        let {_id,folder_id}=req.params;
        let folder=await folderModel.findOne({user_id:_id,_id:folder_id})
        if(!folder){
            return res.status(401).json({status:false,error:"Invalid User"})
        }
        let access=await accessModel.find({owner:_id,folder_id:folder_id})
        return res.status(200).json({status:true,data:access});
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const findUsingPath=async(req,res,next)=>{
      var dirs=[{"folder_name":"root:",_id:null}]
    try{
        let dir_path=req.query.path;
        let {_id}=req.params;
        dir_path=String(dir_path).split("/")
        if(dir_path.length===0 || dir_path[0]!=="root:"){
            return res.status(400).json({"status":false,error:"Invalid Directory Path",dirs})
        }
        else{
            var folder_parent=null;
            for(let i=1;i<dir_path.length;i++){
                let folder_name=dir_path[i];
                if(folder_name===""){
                    continue;
                }
                else{
                    let folder=await folderModel.findOne({user_id:_id,folder_name})
                    if(!folder){
                        let folders=await folderModel.find({folder_parent,user_id:_id});
                        return res.status(400).json({status:false,error:"Invalid Directory Enter",dirs,folders})
                    }
                    if(folder.folder_type===0){
                        if(i===dir_path.length-1){
                            return res.status(200).json({status:true,folders:[folder],dirs})
                        }
                        else{
                          let folders=await folderModel.find({folder_parent,user_id:_id});
                            return res.status(400).json({status:false,error:"Invalid Directory Enter",dirs,folders})
                        }
                    }
                    folder_parent=folder._id;
                    dirs.push({folder_name,_id:folder._id})
                }
            }
        }
        let folders=await folderModel.find({folder_parent,user_id:_id});
        return res.status(200).json({status:true,folders,dirs})
    }
    catch(e){
        console.log(e)
        return res.status(500).json({status:false,error:"Server Error...",dirs})
    }
}

const findaccessUsingPath=async(req,res,next)=>{
    var dirs=[{"folder_name":"root:",_id:null}]
  try{
      let dir_path=req.query.path;
      let folder_id=req.query.id
      let {_id}=req.params;
      let user=await userModel.findById(_id);
      dir_path=String(dir_path).split("/")
      if(dir_path.length===0 || dir_path[0]!=="root:"){
          return res.status(400).json({"status":false,error:"Invalid Directory Path",dirs})
      }
      else{
          var folder_parent=null;
          for(let i=1;i<dir_path.length;i++){
              let folder_name=dir_path[i];
              if(folder_name===""){
                  continue;
              }
              else{
                if(i==1){
                    let access=await accessModel.findOne({folder_id:folder_id,access_by:user.emailid});
                    if(!access){
                        return res.status(401).json({"sttaus":false,"error":"Invalid User"})
                    }
                    _id=access.owner
                    let folder=await folderModel.findById(folder_id)
                    if(!folder){
                        return res.status(401).json({"sttaus":false,"error":"Invalid User"})
                    }
                    folder_parent=folder.folder_parent
                  }
                  let folder=await folderModel.findOne({folder_name,user_id:_id})
                  if(!folder){
                      let folders=await folderModel.find({folder_parent,user_id:_id});
                      return res.status(400).json({status:false,error:"Invalid Directory Enter",dirs,folders})
                  }
                  
                  if(folder.folder_type===0){
                      if(i===dir_path.length-1){
                          return res.status(200).json({status:true,folders:[folder],dirs})
                      }
                      else{
                        let folders=await folderModel.find({folder_parent,user_id:_id});
                          return res.status(400).json({status:false,error:"Invalid Directory Enter",dirs,folders})
                      }
                  }
                  folder_parent=folder._id;
                  dirs.push({folder_name,_id:folder._id})
              }
          }
      }
      if(!folder_parent){
            let folderaccess=await accessModel.find({access_by:user.emailid});
            // console.log(folderaccess)
            let folders=[]
            for(let val of folderaccess){
                let folder=await folderModel.findById(val.folder_id);
                if(folder){
                    folders.push(folder)
                }
            }
            return res.status(200).json({status:true,folders,dirs});
      }
      else{
          let folders=await folderModel.find({folder_parent,user_id:_id});
          return res.status(200).json({status:true,folders,dirs})
    }
  }
  catch(e){
      console.log(e)
      return res.status(500).json({status:false,error:"Server Error...",dirs})
  }
}

const deleteFolder=async(req,res,next)=>{
    try{
        let {_id,folder_id}=req.params;
        let folder=await folderModel.findOne({user_id:_id,_id:folder_id})
        
        if(!folder){
            return error(res,404,"Invalid Folder")
        }
        let t=await chageSpace(-parseFloat(folder.space),folder.folder_parent)
        var folders=[folder]
        var folder_delete=[]
        while(folders.length!==0){
            let folder=folders[folders.length-1]
            let res=await folderModel.deleteOne({_id:folder._id})
            let access=await accessModel.deleteMany({owner:_id,folder_id:folder._id});
            if(folder.folder_type==0){
                removeFile(`user_files/${folder.folder_server_name}`);
            }
            folders.pop()
            let out=Array.from(await folderModel.find({folder_parent:folder._id}));
            for(let val of out){
                folders.push(val)
            }
            folder_delete.push({_id:folder._id,folder_name:folder.folder_name});
        }
        return res.status(200).json({status:true,folder_delete})
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const getLogo=async(req,res,next)=>{
    try{
        let {_id,folder_logo}=req.params;
        var query={folder_logo}
        let folder=await folderModel.findOne(query)
        let user=await userModel.findById(_id)
        let access=await accessModel.findOne({folder_id:folder._id,access_by:user.emailid});
        var filename="folderLogo.png"
        if((access || folder.user_id==_id)){
            filename=folder.folder_logo;
        }
          return res.sendFile(`${root_dir}/Files/user_images/${filename}`)
    }
  catch(e){
    console.log(e)
     return res.sendFile(`${root_dir}/Files/user_images/folderLogo.png`)
  }
}

const getFolder=async(req,res,next)=>{
    try{
        let {_id,folder_access_link}=req.params;
        var query={folder_access_link}
        let folder=await folderModel.findOne(query)
        let user=await userModel.findById(_id)
        let access=await accessModel.findOne({folder_id:folder._id,access_by:user.emailid});
        var filename="user_images/folderLogo.png"
        if((access || String(folder.user_id)==String(_id))){
          return res.sendFile(`${root_dir}/Files/user_files/${folder.folder_server_name}`)
        }
        else{
          return res.status(401).json({status:false.valueOf,error:"You don't have access"})
        }
    }
  catch(e){
    console.log(e)
     return res.sendFile(`${root_dir}/Files/user_images/folderLogo.png`)
  }
}

const addAccessByLink=async(req,res,next)=>{
    try{
        let {folder_type,folder_access_link}=req.params;
        let folder=await folderModel.findOne({folder_access_link});
        // console.log(folder)
        if(!folder){
            return res.status(401).json({status:false,error:"Invalid Folder Access Link"})
        }
        let user_ip=requestIp.getClientIp(req);
        let session=await sessionModel.findOne({user_ip});
        if(!session){
            if(folder.folder_type==0 && folder.access_all){
                return res.sendFile(`${root_dir}/Files/user_files/${folder.folder_server_name}`)
            }
            else{
                return res.redirect(`${process.env.FRONT_END_URL}/login`)
            }
        }
        let user_id=session.user_id;
        let user=await userModel.findById(user_id)
        if(!user){
            if(folder.folder_type==0 && folder.access_all){
                return res.sendFile(`${root_dir}/Files/user_files/${folder.folder_server_name}`)
            }
            else{
                return res.redirect(`${process.env.FRONT_END_URL}/login`)
            }
        }
        let token=user.access_token;
        // console.log(token)
        try{
            if(jwt.decode(token,process.env.SECRET_KEY)){
                let access=await accessModel.findOne({folder_id:folder._id,access_by:user.emailid});
                console.log(String(user._id)===String(folder.user_id))
                if(folder.access_all && !access){
                    access=await accessModel.create({folder_id:folder._id,access_by:user.emailid,owner:folder.user_id});
                }
                if(access || String(user._id)===String(folder.user_id)){
                        if(folder.folder_type==0){
                            return res.sendFile(`${root_dir}/Files/user_files/${folder.folder_server_name}`)
                        }
                    
                        else{
                            return res.redirect(process.env.FRONT_END_URL)
                        }
                }
                return res.status(401).json({status:false,error:"Invalid Folder Access Link"})
            }
            else{
                if(folder.folder_type==0 && folder.access_all){
                    return res.sendFile(`${root_dir}/Files/user_files/${folder.folder_server_name}`)
                }
                else{
                    return res.redirect(`${process.env.FRONT_END_URL}/login`)
                }
            }
        }
        catch(e){
            console.log(e)
            if(folder.folder_type==0 && folder.access_all){
                return res.sendFile(`${root_dir}/Files/user_files/${folder.folder_server_name}`)
            }
            else{
                return res.redirect(`${process.env.FRONT_END_URL}/login`) 
            }
        }
        // let user=await userModel.findById(_id);
    
        
    }
    catch(e){
        console.log("error",e)
        error(res,500,"Server Error....")
    }
}

const getRootSpace=async(req,res,next)=>{
    try{
        let {_id}=req.params;
        let folders=await folderModel.find({user_id:_id,folder_parent:null})
        let total_size=0
        for(let val of folders){
            total_size+=parseFloat(val.space)
        }
        return res.status(200).json({status:true,space:total_size})
    }
    catch(e){
        return res.status(500).json({status:false,space:0})
    }
}

const downloadFile=async(req,res,next)=>{
    try{
        let {_id,folder_access_link}=req.params;
        var query={folder_access_link}
        let folder=await folderModel.findOne(query)
        let user=await userModel.findById(_id)
        let access=await accessModel.findOne({folder_id:folder._id,access_by:user.emailid});
        var filename="user_images/folderLogo.png"
        if((access || String(folder.user_id)==String(_id))){
            if(folder.folder_type==0){
                return res.download(`${root_dir}/Files/user_files/${folder.folder_server_name}`)
            }
            else{
                fs.mkdirSync(`${root_dir}/tem/${folder.user_id}`)
                let tem=downloadFolder(folder._id,`tem/${folder.user_id}`,res,true).then(()=>{}).catch((e)=>{
                    res.sendFile(`${root_dir}/Files/user_images/error.png`)
                })
                return
            }
        }
        else{
          return res.status(401).json({status:false.valueOf,error:"You don't have access"})
        }
    }
    catch(e){
        console.log(e)
     return res.sendFile(`${root_dir}/Files/user_images/error.png`)
    }
}
module.exports={getLogo,getAccess,downloadFile,addAccessByLink,findaccessUsingPath,getFolder,createFolder,getAllFolders,addFile,findUsingPath,updateFolder,updateFolderLogo,addPersonToAccess,removeAccess,deleteFolder,getRootSpace}
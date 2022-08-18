const path=require("path")
const folderModel=require("../model/folder")
const uid=require("generate-unique-id")
const root_dir=path.dirname(path.dirname(__dirname))
const userModel=require(`${root_dir}/user/model/user`)
const error=require(`${root_dir}/middleware/throwError`)
const removeFile=require(`${root_dir}/middleware/removeFile`)
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
        let folder_access_link=`${process.env.BACKEND_URL}/${folder_server_name}`
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
      console.log(folder_parent)
      console.log(filename)
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
        for(let i=0;i<filename.length;i++){
            let file=filename[i];
            var folder=await folderModel.findOne({folder_type:0,folder_parent,user_id:_id,folder_name:file.originalname});
            if(!folder){
                let id=uid({
                    length:10,
                    includeSymbols:['@','$','!','^','&']
                })
                folder=await folderModel.create({folder_access_link:id,folder_type:0,folder_name:file.originalname,folder_server_name:file.filename,folder_extention:file.extention,user_id:_id,folder_parent})
                }
            else{
                removeFile(`user_files/${file.filename}`)
            }
            file_ids.push(folder._id)
        }
        return res.status(200).json({status:true,file_ids})
    }
    catch(e){
        console.log(e)
        error(res,500,"Invalid Parent Folder")   
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
            if(String(folder.folder_logo).startsWith(process.env.BACKEND_URL)){
                let fd=String(folder.folder_logo).split("/")
                removeFile(`user_images/${fd[fd.length-1]}`)
            }
            folder.folder_logo=`${process.env.BACKEND_URL}/accessFile/${filename}`;
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
            if(String(folder.folder_logo).startsWith(process.env.BACKEND_URL)){
                let fd=String(folder.folder_logo).split("/")
                removeFile(`user_images/${fd[fd.length-1]}`)
            }
            folder.folder_logo=folder_logo;
        }
        if(access_all===true || access_all===false){
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
        let {access_people}=req.body;
        let folder=await folderModel.findOne({user_id:_id,_id:folder_id});
        if(!folder){
            return error(res,401,"Inavlid Folder")
        }
        else{
            var invalid=[]
            var valid=[]
            var peoples=folder.access_people;
            var available={}
            for(let i=0;i<peoples.length;i++){
                available[peoples[i]._id]=i;
            }
            for(let i=0;i<access_people.length;i++){
                let people=access_people[i];
                people=await userModel.findOne({emailid:people.emailid});
                if(!people){
                    invalid.push(access_people[i]);
                }
                else if(people._id==_id){
                    continue;
                }
                else{
                    if(available[people._id]){
                        peoples[available[people._id]]['type']=access_people[i].type
                    }
                    else{
                        peoples.push({_id:people._id,access:access_people[i].type});
                    }
                    valid.push(access_people[i]);
                }
            }
            folder.access_people=peoples;
        }
        await folder.save();
        return res.status(200).json({status:true,valid,invalid});
    }
    catch(e){
        console.log(e)
        error(res,500,"Server Error....")
    }
}

const removeAccess=async(req,res,next)=>{
    try{
        let {_id,folder_id}=req.params;
        let {people_emailid}=req.body;
        let folder=await folderModel.findOne({user_id:_id,_id:folder_id});
        if(!folder){
            return error(res,401,"Inavlid Folder")
        }
        else{
            let people=await userModel.findOne({emailid:people_emailid});
            if(!people){
                return res.status(400).json({status:false,error:"Invalid Email Id"})
            }
            var peoples=folder.access_people;
            for(let i=0;i<peoples.length;i++){
                if(String(peoples[i]._id)==String(people._id)){
                    peoples[i]=peoples[peoples.length-1];
                    peoples.pop()
                    break;
                }
            }
            folder.access_people=peoples;
        }
        await folder.save();
        return res.status(200).json({status:true});
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

const deleteFolder=async(req,res,next)=>{
    try{
        let {_id,folder_id}=req.params;
        let folder=await folderModel.findOne({user_id:_id,_id:folder_id})
        if(!folder){
            return error(res,404,"Invalid Folder")
        }
        var folders=[folder]
        var folder_delete=[]
        while(folders.length!==0){
            let folder=folders[folders.length-1]
            let res=await folderModel.deleteOne({_id:folder._id})
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
        let {_id,folder_access_url}=req.params;
        let url=`${process.env.BACKEND_URL}${req.url}`;
        let ind=url.lastIndexOf("?")
        url=url.substring(0,ind)
        var query={user_id:_id,folder_logo:url}

        let folder=await folderModel.findOne(query)
        var filename="user_files/!pka!95tw@.png"
        if(!folder){
          return res.sendFile(`${root_dir}/Files/${filename}`)
        }
        else{
          return res.sendFile(`${root_dir}/Files/user_images/${folder_access_url}`)
        }
    }
  catch(e){
    console.log(e)
     return res.sendFile(`${root_dir}/Files/user_files/!pka!95tw@.png`)
  }
}

const getFolder=async(req,res,next)=>{
    try{
        let {_id,folder_access_url}=req.params;
        
        var query={user_id:_id,folder_access_link:folder_access_url}

        let folder=await folderModel.findOne(query)
        var filename="user_files/!pka!95tw@.png"
        // console.log(folder)
        if(!folder){
          return res.sendFile(`${root_dir}/Files/${filename}`)
        }
        else{
          return res.download(`${root_dir}/Files/user_files/${folder.folder_server_name}`)
        }
    }
  catch(e){
    console.log(e)
     return res.sendFile(`${root_dir}/Files/user_files/!pka!95tw@.png`)
  }
}

module.exports={getLogo,getFolder,createFolder,getAllFolders,addFile,findUsingPath,updateFolder,updateFolderLogo,addPersonToAccess,removeAccess,deleteFolder}
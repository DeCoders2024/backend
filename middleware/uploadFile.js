var multer=require('multer');
const util=require("util")
var uid=require('generate-unique-id')

const UploadFile=(file_path,filepath,isMultiple)=>{
    var des=multer.diskStorage({
        destination:(req,file,path)=>{
            path(null,file_path);
        },
        filename:(req,file,path)=>{
            
                var id=uid({
                    length:10,
                    includeSymbols:['@','$','!','&']
                })
                let ar=file.originalname.split('.')
            path(null,(id+"."+ar[ar.length-1]));}
    })

const upload=multer({storage:des});
if(isMultiple){
    return (
        util.promisify(upload.any(filepath))
    )
}
else{
    return (
        util.promisify(upload.single(filepath))
    )
}
}

const setName=(isMultiple=false)=>{
    return (
        async(req,res,next)=>{
        if(isMultiple){
           
            let filenames=req.files.map((item)=>{  let a=item.originalname.split('.');return {filename:item.filename,originalname:item.originalname,extention:a[a.length-1],size:item.size}})
            req.body["filename"]=filenames
        }
        else{
            req.body['filename']=req.file.filename;
        }
        next()
    }
    )
}

module.exports={UploadFile,setName};
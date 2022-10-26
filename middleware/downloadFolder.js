var file_system = require('fs');
var archiver = require('archiver');
const folderModel=require("../Folders/model/folder")
const path=require("path")
const fs=require("fs-extra")
console.log(path.dirname(__dirname))
async function create(folder_id,par,res,isRoot=false){
    let folder=await folderModel.findById(folder_id);
    let folders=await folderModel.find({folder_parent:folder._id})
    file_system.mkdirSync(`${path.dirname(__dirname)}/${par}/${folder.folder_name}`)
    let par_update=`${par}/${folder.folder_name}`
    for(let val of folders){
        if(val.folder_type==1){
            let res=await create(val._id,par_update,res)
        }
        else{
            file_system.copyFileSync(`${path.dirname(__dirname)}/Files/user_files/${val.folder_server_name}`,`${path.dirname(__dirname)}/${par_update}/${val._id}_${val.folder_name}`)
        }
    }
    if(isRoot){
        var output = file_system.createWriteStream(`${path.dirname(__dirname)}/tem/${folder.folder_server_name}.zip`);
        var archive = archiver('zip');
        output.on('close', function () {
                res.download(`${path.dirname(__dirname)}/tem/${folder.folder_server_name}.zip`,(err)=>{
                    if(err){
                        console.log(err)
                    }
                    
                    fs.removeSync(`${path.dirname(__dirname)}/${par}`)
                    file_system.unlinkSync(`${path.dirname(__dirname)}/tem/${folder.folder_server_name}.zip`)
                })
                // file_system.unlinkSync(`${path.dirname(__dirname)}/${par}`)
        });

        archive.on('error', function(err){
            throw err;
        });

        archive.pipe(output);

        // append files from a sub-directory, putting its contents at the root of archive
        archive.directory(`${path.dirname(__dirname)}/${par_update}`, false);


        archive.finalize();
    }
    return true;
}

module.exports=create



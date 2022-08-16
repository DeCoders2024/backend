const fs=require("fs")
const path=require("path")
const root_dir=(path.dirname(__dirname))

const removeFile=(filepath)=>{
    try{
        fs.unlinkSync(`${root_dir}/Files/${filepath}`)
        return true;
    }
    catch(e){
        console.log(e)
        return false
    }
}

module.exports=removeFile;
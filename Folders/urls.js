const express=require("express")
const router=express.Router()
const {createFolder,getAllFolders,removeAccess,deleteFolder,addFile,findUsingPath,updateFolder,updateFolderLogo,addPersonToAccess}=require("./controllers/folder")
const verifyToken=require("../middleware/verifyToken")
const {UploadFile,setName}=require("../middleware/uploadFile")

router.post("/folder/",verifyToken,createFolder)

router.get("/folder/",verifyToken,getAllFolders)

router.get("/folder/path",verifyToken,findUsingPath)

router.post("/file/",verifyToken,UploadFile("Files/user_files","files",true),setName(true),addFile)

router.put("/file/logo/:folder_id",verifyToken,UploadFile("Files/user_images","logo",false),setName(false),updateFolderLogo);

router.put("/folder/:folder_id",verifyToken,updateFolder)

router.put("/folder/access/:folder_id",verifyToken,addPersonToAccess);

router.put("/folder/r/access/:folder_id",verifyToken,removeAccess);

router.delete("/folder/:folder_id",verifyToken,deleteFolder);

module.exports=router

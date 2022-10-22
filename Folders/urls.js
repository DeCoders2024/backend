const express=require("express")
const router=express.Router()
const {createFolder,getFolder,addAccessByLink,getRootSpace,findaccessUsingPath,getLogo,getAllFolders,removeAccess,deleteFolder,addFile,findUsingPath,updateFolder,updateFolderLogo,addPersonToAccess, getAccess}=require("./controllers/folder")
const verifyToken=require("../middleware/verifyToken")
const {UploadFile,setName}=require("../middleware/uploadFile")
const {verifyIp} =require("../middleware/IP")

router.post("/folder/",verifyToken,createFolder)

router.get("/space/",verifyToken,getRootSpace)

router.get("/folder/",verifyToken,getAllFolders)

router.get("/folder/other/path",verifyToken,findaccessUsingPath)

router.get("/folder/path",verifyToken,findUsingPath)

router.post("/file",verifyToken,UploadFile("Files/user_files","files",true),setName(true),addFile)

router.post("/file/logo/:folder_id",verifyToken,UploadFile("Files/user_images","logo",false),setName(false),updateFolderLogo);

router.put("/folder/:folder_id",verifyToken,updateFolder)

router.get("/folder/a/access/:folder_id",verifyToken,addPersonToAccess);

router.get("/folder/r/access/:access_id",verifyToken,removeAccess);

router.get("/folder/g/access/:folder_id",verifyToken,getAccess);

router.delete("/folder/:folder_id",verifyToken,deleteFolder);

router.get("/access/:folder_type/:folder_access_link",verifyIp,verifyToken,getFolder)

router.get("/folder_logo/:folder_logo",verifyIp,verifyToken,getLogo)

router.get("/access/other/:folder_type/:folder_access_link",addAccessByLink)

module.exports=router

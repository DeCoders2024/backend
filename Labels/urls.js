const express=require("express")
const router=express.Router()
const {getLogo,getAccess,addAccessByLink,findaccessUsingPath,createLabel,getAlllabels,addNote,findUsingPath,updatelabel,updatelabelLogo,addPersonToAccess,removeAccess,deletelabel}=require("./controllers/label")
const verifyToken=require("../middleware/verifyToken")
const {UploadFile,setName}=require("../middleware/uploadFile")
const {verifyIp} =require("../middleware/IP")

router.post("/label/",verifyToken,createLabel)

router.get("/label/",verifyToken,getAlllabels)

router.get("/label/other/path",verifyToken,findaccessUsingPath)

router.get("/label/path",verifyToken,findUsingPath)

router.post("/note",verifyToken,addNote)

router.post("/label/logo/:label_id",verifyToken,UploadFile("Files/user_images","logo",false),setName(false),updatelabelLogo);

router.put("/label/:label_id",verifyToken,updatelabel)

router.get("/label/a/access/:label_id",verifyToken,addPersonToAccess);

router.get("/label/r/access/:access_id",verifyToken,removeAccess);

router.get("/label/g/access/:label_id",verifyToken,getAccess);

router.delete("/label/:label_id",verifyToken,deletelabel);

router.get("/label_logo/:label_logo",verifyIp,verifyToken,getLogo)

router.get("/access/other/:label_type/:label_access_link",addAccessByLink)

module.exports=router

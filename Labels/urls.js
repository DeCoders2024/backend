const express=require("express")
const router=express.Router()
const {getAccess,createLabel,getAlllabels,updatelabel,addPersonToAccess,removeAccess,deletelabel}=require("./controllers/label")
const verifyToken=require("../middleware/verifyToken")
const {UploadFile,setName}=require("../middleware/uploadFile")
const {verifyIp} =require("../middleware/IP")

router.post("/label/",verifyToken,createLabel)

router.get("/label/",verifyToken,getAlllabels)

router.put("/label/:label_id",verifyToken,updatelabel)

router.get("/label/a/access/:label_id",verifyToken,addPersonToAccess);

router.get("/label/r/access/:access_id",verifyToken,removeAccess);

router.get("/label/g/access/:label_id",verifyToken,getAccess);

router.delete("/label/:label_id",verifyToken,deletelabel);

module.exports=router

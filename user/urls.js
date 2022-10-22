const express=require("express");
const router=express.Router();
const {AddUser,getUserImage,login,updateProfile,getUser,Logout,updateUser}=require("./controllers/user");
const verifyToken=require("../middleware/verifyToken");
const {UploadFile,setName}=require("../middleware/uploadFile");
const { verifyIp } = require("../middleware/IP");

router.post("/",AddUser);

router.post("/login",login);

router.post("/profile",verifyToken,UploadFile("Files/user_images","picture",false),setName(false),updateProfile);

router.put("/",verifyToken,updateUser);

router.get("/",verifyToken,getUser);

router.get("/logout",verifyToken,Logout);

router.get("/profile_pic",verifyIp,verifyToken,getUserImage);


module.exports=router;
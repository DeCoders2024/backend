const express=require("express");
const router=express.Router();
const {AddUser,login,updateProfile,getUser,Logout,updateUser}=require("./controllers/user");
const verifyToken=require("../middleware/verifyToken");
const {UploadFile,setName}=require("../middleware/uploadFile")

router.post("/",AddUser);

router.post("/login",login);

router.put("/",verifyToken,UploadFile("Files/user_images","picture",false),setName(false),updateProfile);

router.put("/raw",verifyToken,updateUser);

router.get("/",verifyToken,getUser);

router.get("/",verifyToken,Logout);


module.exports=router;
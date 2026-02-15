import { Router } from "express";
import { loginUser ,registerUser , logoutUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router()

//router for registration of user
router.route("/register").post(
    upload.fields([ // it enalbes us to upload images 
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
) 

//router for login of user
router.route("/login").post(loginUser)



//secured route for logout of user
router.route("/logout").post(verifyJWT, logoutUser)
export default router
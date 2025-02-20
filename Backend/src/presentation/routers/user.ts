import { Router,Request ,Response} from "express";
import {controller,login} from '../../config/users'
import jwt from "../../config/jwt";
const router=Router()
router.post("/signup",controller.create.bind(controller))
router.post('/login',controller.login)
router.post('/glogin',controller.glogin)
router.post("/verify",controller.otpverify,controller.verify)
router.post("/resent",controller.resendOtp)
router.get("/autherisation",controller.jwtmiddlewere,controller.reduxvarify)
router.post('/forgotpass',controller.forgotPass)//for send otp and make tocken
router.post('/forgtotp',controller.otpverify,controller.verifyFps)//for varify otp of forgat pass
router.post('/changepassword',controller.jwtmiddlewere,controller.changepass)



router.post("/logout",controller.logout )



export default router
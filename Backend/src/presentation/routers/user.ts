import { Router,Request ,Response} from "express";
import Controller from '../controller/user'
import {jwtVerify} from "../middilwere/varify";
import Admincontroler from "../controller/admin";
import { adminUsecase } from "../../config/dependencies";
const controller=new Controller()
const adminControler=new Admincontroler()
const router=Router()
router.post("/signup",controller.create.bind(controller))
router.post("/verify",controller.otpverify,controller.verifyed)
router.post('/login',controller.login)
router.post('/glogin',controller.glogin)
router.post("/resent",controller.resendOtp)
router.get("/autherisation",jwtVerify,controller.reduxvarify)
router.post('/forgotpass',controller.forgotPassOtpsent)//for send otp and make tocken
router.post('/forgtotp',controller.otpverify,controller.verifyForgotpassword)//for varify otp of forgat pass
router.post('/changepassword',jwtVerify,controller.changepass)
router.post("/logout",controller.logout )
router.get('/allusers',jwtVerify,adminControler.userData)
router.post('/blockuser',jwtVerify,adminControler.blockUser)






export default router
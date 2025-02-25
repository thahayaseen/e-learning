import { Router,Request ,Response} from "express";
import Controller from '../controller/user'
import {jwtVerify} from "../middilwere/varify";
import Admincontroler from "../controller/admin";
import { adminUsecase, signUpUser } from "../../config/dependencies";
const controller=new Controller(signUpUser)
const adminControler=new Admincontroler(adminUsecase)
const router=Router()
router.post("/signup",controller.create.bind(controller))
router.post("/verify",controller.otpverify.bind(controller),controller.verifyed.bind(controller))
router.post('/login',controller.login.bind(controller))
router.post('/glogin',controller.glogin.bind(controller))
router.post("/resent",jwtVerify,controller.resendOtp.bind(controller))
router.get("/autherisation",jwtVerify,controller.reduxvarify.bind(controller))
router.post('/forgotpass',controller.forgotPassOtpsent.bind(controller))//for send otp and make tocken
router.post('/forgtotp',controller.otpverify.bind(controller),controller.verifyForgotpassword.bind(controller))//for varify otp of forgat pass
router.post('/changepassword',jwtVerify,controller.changepass.bind(controller))
router.post("/logout",controller.logout.bind(controller) )
router.get('/allusers',jwtVerify,adminControler.userData.bind(adminControler))
router.post('/blockuser',jwtVerify,adminControler.blockUser.bind(adminControler))






export default router
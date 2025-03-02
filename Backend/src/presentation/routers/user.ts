import { Router,Request ,Response} from "express";
import { controller } from "../service/controler.config";
import {jwtVerify} from "../middilwere/varify";
import Admincontroler from "../controller/admin";
import { adminUsecase, signUpUser } from "../../config/dependencies";

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
router.get('/profile',jwtVerify,controller.uProfile.bind(controller))
router.get('/mentoraplication',jwtVerify,controller.uProfile.bind(controller))






export default router
import { Router,Request ,Response} from "express";
import { controller, mentorController } from "../service/controler.config";
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
router.get('/getcourse/:page/:type',jwtVerify,adminControler.getCourseunaproved.bind(adminControler))
router.get('/allcourses',controller.getAllcourseUser.bind(controller))
router.get('/profile',jwtVerify,controller.uProfile.bind(controller))
// router.get('/mentoraplication',jwtVerify,controller.uProfile.bind(controller))
router.post('/addcategory',jwtVerify,adminControler.createCategorys.bind(adminControler))
router.delete('/deleteCategory/:categoryid',jwtVerify,adminControler.deleteCategory.bind(adminControler))
router.post('/editcategory/:categoryid',jwtVerify,adminControler.editCategory.bind(adminControler))
router.get('/course/:courseid',jwtVerify,controller.GetCourse.bind(controller))
router.get('/course/:courseid/qustionans/:taskid',jwtVerify,controller.GetCourse.bind(controller))//for task qustion anser
router.post('/purchase/:courseId',jwtVerify,controller.BuyCourse.bind(controller))
// router.post('/changepass',controller.)
router.post('/startchat',jwtVerify,mentorController.startChat.bind(mentorController))
router.get('/getchat/:roomid',jwtVerify,controller.getchats.bind(controller))
router.post('/requestmeet',jwtVerify,controller.Requesmeeting.bind(controller))
router.post('/updatetime/:meetid',jwtVerify,controller.UpdateTime.bind(controller))
router.get('/meeting/:id',jwtVerify,controller.addUsermeet.bind(controller))
router.get('/leavemeeting/:id',jwtVerify,controller.leaveMeeting.bind(controller))





export default router
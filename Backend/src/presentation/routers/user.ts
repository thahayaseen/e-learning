import express, { Router, Request, Response } from "express";
import { controller, mentorController } from "../service/controler.config";
import { jwtVerify } from "../middilwere/varify";
import Admincontroler from "../controller/admin";
import {
  adminUsecase,
  signUpUser,
  userUseCase,
} from "../../config/dependencies";
import { roleChecker } from "../middilwere/roleChecking";
import { Roles } from "../../app/useCases/enum/User";

const adminControler = new Admincontroler(adminUsecase, userUseCase);
const router = Router();
router.post("/signup", controller.create.bind(controller));
router.post(
  "/verify",
  controller.otpverify.bind(controller),
  controller.verifyed.bind(controller)
);
router.post("/login", controller.login.bind(controller));
router.post("/glogin", controller.glogin.bind(controller));
router.post("/resent", jwtVerify, controller.resendOtp.bind(controller));
router.get(
  "/autherisation",
  jwtVerify,
  controller.reduxvarify.bind(controller)
);
router.post("/forgotpass", controller.forgotPassOtpsent.bind(controller)); //for send otp and make tocken
router.post(
  "/forgtotp",
  controller.otpverify.bind(controller),
  controller.verifyForgotpassword.bind(controller)
); //for varify otp of forgat pass
router.post(
  "/changepassword",
  jwtVerify,
  controller.changepass.bind(controller)
);
router.post("/logout", controller.logout.bind(controller));
router.get(
  "/allusers",
  jwtVerify,
  roleChecker(Roles.ADMIN),
  adminControler.userData.bind(adminControler)
);
router.put(
  "/blockuser",
  jwtVerify,
  roleChecker(Roles.ADMIN),

  adminControler.blockUser.bind(adminControler)
);
router.get(
  "/getcourse/:page/:type",
  jwtVerify,
  roleChecker(Roles.ADMIN),

  adminControler.getCourseunaproved.bind(adminControler)
);
router.get(
  "/allcourses",
  // jwtVerify,

  controller.getAllcourseUser.bind(controller)
);
router.get("/profile", jwtVerify, controller.uProfile.bind(controller));
// router.get('/mentoraplication',jwtVerify,controller.uProfile.bind(controller))
router.post(
  "/addcategory",
  jwtVerify,
  roleChecker(Roles.ADMIN),

  adminControler.createCategorys.bind(adminControler)
);
router.put(
  "/actionCategory/:categoryid",
  jwtVerify,
  roleChecker(Roles.ADMIN),
  adminControler.actionCategory.bind(adminControler)
);
router.put(
  "/editcategory/:categoryid",
  jwtVerify,
  roleChecker(Roles.ADMIN),
  adminControler.editCategory.bind(adminControler)
);
router.get(
  "/course/:courseid",
  jwtVerify,
  controller.GetCourse.bind(controller)
);
router.post(
  "/course/:courseid/qustionans/:taskid",
  jwtVerify,
  controller.getQustionans.bind(controller)
); //for task qustion anser
router.post(
  "/purchase/:courseId",
  jwtVerify,
  controller.BuyCourse.bind(controller)
);
router.post(
  "/paymentsuccess",
  jwtVerify,
  controller.paymentsuccss.bind(controller)
);

// router.post('/changepass',controller.)
router.post(
  "/startchat",
  jwtVerify,
  mentorController.startChat.bind(mentorController)
);
router.get("/getchat/:roomid", jwtVerify, controller.getchats.bind(controller));
router.post(
  "/requestmeet",
  jwtVerify,
  controller.Requesmeeting.bind(controller)
);
router.put(
  "/updatetime/:meetid",
  jwtVerify,
  roleChecker(Roles.MENTOR),
  controller.UpdateTime.bind(controller)
);
router.get("/meeting/:id", jwtVerify, controller.addUsermeet.bind(controller));
router.get(
  "/leavemeeting/:id",
  jwtVerify,
  controller.leaveMeeting.bind(controller)
);
// router.post('/makesesstion',controller.stripeSesstion.bind(controller))
router.put(
  "/progress/update-video",
  jwtVerify,
  controller.updateVideoProgress.bind(controller)
);
router.post(
  "/progress/mark-completed",
  jwtVerify,
  controller.updatacompleteLesson.bind(controller)
);
router.get(
  "/progress/:courseid",
  jwtVerify,
  controller.getSelectedProgressContorller.bind(controller)
);
router.get("/getreviews/:courseid", controller.getAllReviews.bind(controller));
router.post("/addreview", jwtVerify, controller.addReivews.bind(controller));
router.post(
  "/b-a-mentor",
  jwtVerify,
  controller.requestMentor.bind(controller)
);
router.get(
  "/getall-mentor-requst",
  jwtVerify,
  roleChecker(Roles.ADMIN),
  adminControler.getAllmentorrequst.bind(adminControler)
);
router.put(
  "/action-be-mentor/:dataid",
  jwtVerify,
  roleChecker(Roles.ADMIN),

  adminControler.actionToRequst.bind(adminControler)
);
router.put(
  "/update-profile",
  jwtVerify,
  controller.changeProfile.bind(controller)
);
router.put(
  "/changepassword",
  jwtVerify,
  controller.changePassword.bind(controller)
);
router.get("/orders", jwtVerify, controller.orders.bind(controller));
router.get(
  "/certificate/:courseId",
  jwtVerify,
  controller.Coursecetrificate.bind(controller)
);
router.get("/reorder/:orderid", jwtVerify, controller.reOrder.bind(controller));
router.get(
  "/revenue/total",
  jwtVerify,
  roleChecker(Roles.ADMIN),

  controller.getTotalRevenue.bind(controller)
);
router.get(
  "/revenue/mentors",
  jwtVerify,
  roleChecker(Roles.ADMIN),

  controller.getMentorRevenue.bind(controller)
);
router.get(
  "/revenue/time",
  jwtVerify,
  roleChecker(Roles.ADMIN),

  controller.getTimeRevenue.bind(controller)
);

export default router;

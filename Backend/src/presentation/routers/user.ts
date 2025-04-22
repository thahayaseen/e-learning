import express, { Router, Request, Response } from "express";
import {
  controller,
  courseController,
  mentorController,
  OrderController,
} from "../service/controler.config";

import Admincontroler from "../controller/admin.controller";
import {
  adminUsecase,
  Middlewares,
  signUpUser,
  userUseCase,
} from "../../config/dependencies";

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
router.post(
  "/resent",
  Middlewares.jwtVerify,
  controller.resendOtp.bind(controller)
);
router.get(
  "/autherisation",
  Middlewares.jwtVerify,
  controller.reduxvarify.bind(controller)
);
router.post("/forgotpass", controller.forgotPassOtpsent.bind(controller)); //for send otp and make tocken
router.post(
  "/forgtotp",
  controller.otpverify.bind(controller),
  controller.verifyForgotpassword.bind(controller)
); //for varify otp of forgat pass
router.put(
  "/resetchangepassword",
  Middlewares.jwtVerify,
  controller.changepass.bind(controller)
);
router.post("/logout", controller.logout.bind(controller));
router.get(
  "/allusers",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),
  adminControler.userData.bind(adminControler)
);
router.put(
  "/blockuser",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),

  adminControler.blockUser.bind(adminControler)
);
router.get(
  "/getcourse/:page/:type",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),

  adminControler.getCourseunaproved.bind(adminControler)
);
router.get(
  "/allcourses",
  // Middlewares.jwtVerify,

  courseController.getAllcourseUser.bind(courseController)
);
router.get(
  "/profile",
  Middlewares.jwtVerify,
  controller.uProfile.bind(controller)
);
// router.get('/mentoraplication',Middlewares.jwtVerify,controller.uProfile.bind(controller))
router.post(
  "/addcategory",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),

  adminControler.createCategorys.bind(adminControler)
);
router.put(
  "/actionCategory/:categoryid",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),
  adminControler.actionCategory.bind(adminControler)
);
router.put(
  "/editcategory/:categoryid",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),
  adminControler.editCategory.bind(adminControler)
);
router.get(
  "/course/:courseid",
  Middlewares.jwtVerify,
  courseController.GetCourse.bind(courseController)
);
router.post(
  "/course/:courseid/qustionans/:taskid",
  Middlewares.jwtVerify,
  courseController.getQustionans.bind(courseController)
); //for task qustion anser
router.post(
  "/purchase/:courseId",
  Middlewares.jwtVerify,
  OrderController.BuyCourse.bind(OrderController)
);
router.post(
  "/paymentsuccess",
  Middlewares.jwtVerify,
  OrderController.paymentsuccss.bind(OrderController)
);

// router.post('/changepass',controller.)
router.post(
  "/startchat",
  Middlewares.jwtVerify,
  mentorController.startChat.bind(mentorController)
);
router.get(
  "/getchat/:roomid",
  Middlewares.jwtVerify,
  controller.getchats.bind(controller)
);
router.post(
  "/requestmeet",
  Middlewares.jwtVerify,
  controller.Requesmeeting.bind(controller)
);
router.put(
  "/updatetime/:meetid",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.MENTOR),
  controller.UpdateTime.bind(controller)
);
router.get(
  "/meeting/:id",
  Middlewares.jwtVerify,
  controller.addUsermeet.bind(controller)
);
router.get(
  "/leavemeeting/:id",
  Middlewares.jwtVerify,
  controller.leaveMeeting.bind(controller)
);
// router.post('/makesesstion',controller.stripeSesstion.bind(controller))
router.put(
  "/progress/update-video",
  Middlewares.jwtVerify,
  controller.updateVideoProgress.bind(controller)
);
router.post(
  "/progress/mark-completed",
  Middlewares.jwtVerify,
  controller.updatacompleteLesson.bind(controller)
);
router.get(
  "/progress/:courseid",
  Middlewares.jwtVerify,
  controller.getSelectedProgressContorller.bind(controller)
);
router.get(
  "/getreviews/:courseid",
  courseController.getAllReviews.bind(courseController)
);
router.post(
  "/addreview",
  Middlewares.jwtVerify,
  courseController.addReivews.bind(courseController)
);
router.post(
  "/b-a-mentor",
  Middlewares.jwtVerify,
  controller.requestMentor.bind(controller)
);
router.get(
  "/getall-mentor-requst",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),
  adminControler.getAllmentorrequst.bind(adminControler)
);
router.put(
  "/action-be-mentor/:dataid",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),

  adminControler.actionToRequst.bind(adminControler)
);
router.put(
  "/update-profile",
  Middlewares.jwtVerify,
  controller.changeProfile.bind(controller)
);
router.put(
  "/changepassword",
  Middlewares.jwtVerify,
  controller.changePassword.bind(controller)
);
router.get(
  "/orders",
  Middlewares.jwtVerify,
  courseController.orders.bind(courseController)
);
router.get(
  "/certificate/:courseId",
  Middlewares.jwtVerify,
  courseController.Coursecetrificate.bind(courseController)
);
router.get(
  "/reorder/:orderid",
  Middlewares.jwtVerify,
  OrderController.reOrder.bind(OrderController)
);
router.get(
  "/revenue/total",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),

  mentorController.getTotalRevenue.bind(mentorController)
);
router.get(
  "/revenue/mentors",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),

  mentorController.getMentorRevenue.bind(mentorController)
);
router.get(
  "/revenue/time",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),

  mentorController.getTimeRevenue.bind(mentorController)
);
router.get(
  "/allcertificate",
  Middlewares.jwtVerify,
  courseController.getAllCertificate.bind(courseController)
);

export default router;

import { Router } from 'express';
import { adminUsecase, Middlewares, userUseCase } from '../../config/dependencies';
import { Roles } from '../../app/useCases/enum/User';
import Admincontroler from '../controller/admin.controller';

const adminControler = new Admincontroler(adminUsecase, userUseCase);
const router=Router()

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
  "/getcourse/:type",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),

  adminControler.getCourseunaproved.bind(adminControler)
);
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
  "/action-course/:id",
  Middlewares.jwtVerify,
  Middlewares.roleChecker(Roles.ADMIN),

  adminControler.Approve_RejectCourse.bind(adminControler)
);
export default router
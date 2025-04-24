// const controller=new Controller(signUpUser)
import { CourseUsecase } from "../../app/useCases/CourseUsecase";
import RevenueUseCase from "../../app/useCases/revenue.usecase";
import {
  adminUsecase,
  courseUsecase,
  LoginUsecase,
  meetUsecase,
  Mentorusecase,
  signUpUser,
  socketusecases,
  userRepository,
  userUseCase,
} from "../../config/dependencies";
import revenueRepository from "../../infra/repositories/Repository.revenue";
import { MentorController } from "../controller/Cmentor.controller";
import { courseControllerClass } from "../controller/course.controller";
import { Ordercontroller } from "../controller/order.controller";
import UserController from "../controller/user.controller";
const revenueuseCase = new RevenueUseCase(revenueRepository);

export const controller = new UserController(
  signUpUser,
  LoginUsecase,
  adminUsecase,
  userUseCase,
  courseUsecase,
  socketusecases,
  meetUsecase
);
export const mentorController = new MentorController(
  Mentorusecase,
  userUseCase,
  courseUsecase,
  socketusecases,
  meetUsecase,
  revenueuseCase
);
export const courseController = new courseControllerClass(
  courseUsecase,
  meetUsecase,
  userUseCase,
  LoginUsecase,
  Mentorusecase
);
export const OrderController = new Ordercontroller(courseUsecase, userUseCase);

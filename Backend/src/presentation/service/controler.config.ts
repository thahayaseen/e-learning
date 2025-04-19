import { courseMiddlewere } from "../middilwere/coursevarify.middleware";
// const controller=new Controller(signUpUser)

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
import revenueRepository from "../../infra/repositories/revenueRepository";
import { MentorController } from "../controller/Cmentor";
import UserController from "../controller/user";
import { Coursecontroller } from "../controller/course.controller";
const revenueuseCase = new RevenueUseCase(revenueRepository);

export const controller = new UserController(
  signUpUser,
  LoginUsecase,
  adminUsecase,
  userUseCase,
  courseUsecase,
  socketusecases,
  meetUsecase,
  revenueuseCase
);
export const mentorController = new MentorController(
  Mentorusecase,
  userUseCase,
  courseUsecase,
  socketusecases,
  meetUsecase
);
export const courseMiddleweres = new courseMiddlewere(
  userUseCase,
  courseUsecase
);
export const courseContoller = new Coursecontroller(courseUsecase,Mentorusecase);

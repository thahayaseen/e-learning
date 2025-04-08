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
import revenueRepository from "../../infra/repositories/revenueRepository";
import { MentorController } from "../controller/Cmentor";
import UserController from "../controller/user";
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

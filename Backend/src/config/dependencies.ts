import { userServises } from "../app/services/userService";
import JwtService from "../infra/provider/JwtService";
import RedisProvider from "../infra/provider/Redis";
import MailProvider from "../infra/provider/nodemailer";
import { MailServices } from "../app/adapters/MailerAdapter";
import UserRepository from "../infra/repositories/User";
import { MessageRepository } from "../infra/repositories/RepositoryMessage";
import { ChatroomRepository } from "../infra/repositories/RepositoryChatroom";
import RedisUsecases from "../app/adapters/RedisAdapter";
import { RepositoryCategory } from "../infra/repositories/RepositoryCategory";
import {
  JWT_SECRET,
  JWT_REFRESH_KEY,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
} from "./config";
export const jwtTockenProvider = new JwtService(
  JWT_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_KEY,
  JWT_REFRESH_EXPIRY
);
export const redisProvider = new RedisProvider();
export const mailProvider = new MailProvider();
export const mailServices = new MailServices(mailProvider);
export const userRepository = new UserRepository();
export const redisUseCases = new RedisUsecases(redisProvider);
export const chatroomRepo = new ChatroomRepository();
export const messagerepo = new MessageRepository();
export const category = new RepositoryCategory();
import Signup from "../app/useCases/Signup.usecase";
import Login from "../app/useCases/Login.usecase";
import admin from "../app/useCases/admin.usecase";
import { UserUsecase } from "../app/useCases/User.usecase";
import { MentorUsecase } from "../app/useCases/mentor.usecase";
import { RepositoryCourses } from "../infra/repositories/RepositoryCourses";
import { CourseUsecase } from "../app/useCases/CourseUsecase";
import { SocketuseCase } from "../app/useCases/socketio.usecase";
import MeetingUsecase from "../app/useCases/Meeting.usecase";
import RepositoryMeeting from "../infra/repositories/RepositoryMeeting";
import ReiviewRepositry from "../infra/repositories/ReiviewRepositry";
import beaMentorRepositroy from "../infra/repositories/beaMentorRepositroy";
import certificateRepository from "../infra/repositories/certificateRepository";
import { AllMiddleware } from "../presentation/middilwere/roleChecking";
export const CourseRepositoy = new RepositoryCourses();
export const Mentorusecase = new MentorUsecase(
  userRepository,
  category,
  CourseRepositoy
);
export const signUpUser = new Signup(userRepository, jwtTockenProvider);
export const LoginUsecase = new Login(userRepository, jwtTockenProvider);
export const adminUsecase = new admin(
  userRepository,
  category,
  CourseRepositoy
);
export const userUseCase = new UserUsecase(
  userRepository,
  CourseRepositoy,
  beaMentorRepositroy
);
export const courseUsecase = new CourseUsecase(
  userRepository,
  CourseRepositoy,
  ReiviewRepositry,
  certificateRepository
);
export const meetUsecase = new MeetingUsecase(RepositoryMeeting);
export const socketusecases = new SocketuseCase(
  chatroomRepo,
  messagerepo,
  userUseCase,
  chatroomRepo,
  meetUsecase
);
export const Middlewares = new AllMiddleware(LoginUsecase,userUseCase,courseUsecase)
export type adminUsecaseType = typeof adminUsecase;
export const userServisess = new userServises(userUseCase, courseUsecase);

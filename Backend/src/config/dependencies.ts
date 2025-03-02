import JwtService from "../infra/provider/JwtService";
import RedisProvider from "../infra/provider/Redis";
import MailProvider from "../infra/provider/nodemailer";
import { MailServices } from "../app/adapters/MailerAdapter";
import UserRepository from "../infra/repositories/User";
import RedisUsecases from "../app/adapters/RedisAdapter";
import { JWT_SECRET, JWT_REFRESH_KEY, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY } from "./config";
export const jwtTockenProvider = new JwtService(JWT_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_KEY, JWT_REFRESH_EXPIRY);
export const redisProvider = new RedisProvider();
export const mailProvider = new MailProvider();
export const mailServices = new MailServices(mailProvider);
export const userRepository = new UserRepository();
export const redisUseCases = new RedisUsecases(redisProvider);

import Signup from "../app/useCases/Signup";
import Login from "../app/useCases/Login";
import admin from "../app/useCases/admin";
import { UserUsecase } from "../app/useCases/User";
export const signUpUser=new Signup(userRepository,jwtTockenProvider)
export const LoginUsecase=new Login(userRepository,jwtTockenProvider)
export const adminUsecase=new admin(userRepository)
export const userUseCase=new UserUsecase(userRepository)
export type adminUsecaseType=typeof adminUsecase
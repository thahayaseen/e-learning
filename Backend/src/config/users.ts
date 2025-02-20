import UserRepository from "../infrastructure/repositories/User";
import UserController from "../presentation/controller/user";
import UserCases from "../application/useCases/Sigup";
import Login from "../application/useCases/Login";
export const userRepo = new UserRepository();
export const userCases = new UserCases();
export const controller = new UserController();
export const login =new Login()
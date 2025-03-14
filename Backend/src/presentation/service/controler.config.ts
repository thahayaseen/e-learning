// const controller=new Controller(signUpUser)
import { CourseUsecase } from "../../app/useCases/CourseUsecase";
import { adminUsecase, courseUsecase, LoginUsecase, meetUsecase, Mentorusecase, signUpUser, socketusecases, userRepository, userUseCase } from "../../config/dependencies";
import { MentorController } from "../controller/Cmentor";
import UserController from "../controller/user";


export const controller=new UserController(signUpUser,LoginUsecase,adminUsecase,userUseCase,courseUsecase,socketusecases,meetUsecase)
    export const mentorController=new MentorController(Mentorusecase,userUseCase,courseUsecase,socketusecases)
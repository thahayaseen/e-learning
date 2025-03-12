import { UserDTO } from "../../app/dtos/Duser";
import { ICourses } from "../../infra/database/models/course";


export interface IuserUseCase{
    UseProfileByemail(email:string):Promise<UserDTO|null> 
   
}
import User from '../../domain/entities/UserSchema';
import { IUserModel } from '../../infra/database/models/User';
import AdminUserDTO from '../dtos/adminDTOUsers';
import {UserDTO} from '../dtos/Duser'
export interface Alluserinterface{
    formattedData:AdminUserDTO[],
    totalpages:number
}
export default interface IUserReposetory{
    findByid(id:string):Promise<UserDTO|null>;
    findByEmail(email:string):Promise<UserDTO|null>;
    create(users:UserDTO):Promise<UserDTO|null>;
    updateName(name:string,id:string):Promise<UserDTO|null>;
    changepass(id:string,password:string):Promise<void|null>;
    verify(id:string):Promise<void|null>
    hashpass(pass:string):Promise<string>
    Hmatch(Upass:string,Hpass:string):Promise<boolean>
    findAlluser(limit:number,skip:number):Promise<Alluserinterface>
    Blockuser(id:string,type:boolean):Promise<void>
    updatagid(id:string,git:string):Promise<UserDTO|null>
} 
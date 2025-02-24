import User from "../../domain/entities/UserSchema"

export interface UserDTO{
    name:string,
    role:string,
    email:string
}
export interface userCreateDTO{
    users?:User|string;
    message:string;
    userid?:string;
    token?:string;
}
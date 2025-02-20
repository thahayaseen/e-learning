import User from '../entities/UserSchema'
export default interface IUserReposetory{
    findByid(id:string):Promise<User|null>;
    findByEmail(email:string):Promise<User|null>;
    create(users:User):Promise<any>;
    updateName(name:string,id:string):Promise<User|null>;
    changepass(id:string,password:string):Promise<void|null>;
    verify(id:string):Promise<void|null>
    hashpass(pass:string):Promise<string>
    Hmatch(Upass:string,Hpass:string):Promise<boolean>

}
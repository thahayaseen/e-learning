export interface IPasswordHasher{
    hashpassword(password:string):Promise<string>;
    comparePasswords(password:string,hashedpassword:string):Promise<string>
}
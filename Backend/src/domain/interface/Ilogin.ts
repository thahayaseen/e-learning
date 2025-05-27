import { JwtPayload } from "jsonwebtoken";

export interface ILogin {
  logins(email: string, password: string): Promise<{
    success: boolean;
    message: string;
    user: { name: string; email: string; role: string };
    datas: string;
  }>;
  
  forgetpass(email: string): Promise<{ token: string }>;
  
  forgotTocken(userid: string): Promise<string>;
  
  changepassword(userid: string, password: string): Promise<void>;
  
  protectByjwt(token: string): Promise<JwtPayload | string|null>;
  
  generatToken(data: JwtPayload): Promise<string>;
}

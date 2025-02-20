import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// const secretKey: Secret = String(process.env.JWT_SECRET || "default_secret");
interface AuthServises{
  error?:string
  user?:any
}
interface auth{
  accses:string,
  refresh:string
}
export class JwtService {
  constructor(private secretKey:string,private RsecretKey:string){}
  accsessToken(payload:object){
    return jwt.sign(payload, this.secretKey, {
      expiresIn: "15m",
    })
  }
  RefreshToken(payload:object){
    return jwt.sign(payload, this.RsecretKey, {
      expiresIn: "7d",
    })
  }
   async generateToken(payload: object): Promise<auth> {
    
    return {accses:this.accsessToken(payload),refresh:this.RefreshToken(payload)}
  }

    verifyToken(token: string):  JwtPayload | null {
    try {
      return  jwt.verify(token, this.secretKey) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}

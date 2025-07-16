  import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";
  import dotenv from "dotenv";
  import { auth, IJwtService } from "../../domain/Provider/Ijwt";

  dotenv.config();

  interface AuthServises {
    error?: string;
    user?: string;
  } 

  export default class JwtService implements IJwtService {
    constructor(private secretKey: string,private accTime:number, private RefreshKey: string,private refreshTime:number) {}
    async exicute(payload: object): Promise<auth> {
      return {
        access: this.accsessToken(payload),
        refresh: this.RefreshToken(payload),
      };
    }
    accsessToken(payload: object) {
      return jwt.sign(payload, this.secretKey, {
        expiresIn: `${this.accTime}m`,
      });
    }
    RefreshToken(payload: object) {
      return jwt.sign(payload, this.RefreshKey, {
        expiresIn: `${this.refreshTime}d`,
      });
    }

    verifyToken(token: string): JwtPayload | null {
      try {
        return jwt.verify(token, this.secretKey) as JwtPayload;
      } catch (error) {
        return null;
      }
    }
  }

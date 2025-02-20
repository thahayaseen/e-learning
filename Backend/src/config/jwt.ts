import { JwtService } from "../infrastructure/jwt/JwtService";
export default new JwtService(process.env.JWT_SECRET as string,process.env.JWT_RSECRET as string)

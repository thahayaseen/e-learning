import { JwtPayload } from "jsonwebtoken";

export interface IJwtService {
  exicute(payload: object): Promise<auth>;
  accsessToken(payload: object): string;
  RefreshToken(payload: object): string;
  verifyToken(token: string): JwtPayload | null;
}

export interface auth {
  access: string;
  refresh: string;
}

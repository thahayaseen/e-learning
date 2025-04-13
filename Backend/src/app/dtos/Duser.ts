import User from "../../domain/entities/UserSchema";
import { Roles } from "../useCases/enum/User";

// export interface UserDTO {
//   name: string;
//   role: string;
//   email: string;
// }
export interface userCreateDTO {
  users?: User | string;
  message: string;
  userid?: string;
  token?: string;
}
export interface GoogleLoginDTO {
  id: string;
  name: string;
  email: string;
  picture: string;
  role?: "admin" | "student" | "mentor";
}
export interface UserDTO {
  _id?: string;
  name: string;
  email: string;
  username?: string;
  password?: string; // Optional if using OAuth
  profile?: ProfileDTO; // Optional profile
  gid?: string | null; // Google ID for OAuth users
  verified?: boolean;
  isBlocked?: boolean;
  role?: "admin" | "student" | "mentor";
  purchasedCourses?: string[];
  subscription?: string | null;
  updatedAt?: string;
  CreatedAt?:Date
}

export interface ProfileDTO {
  avatar?: string;
  experience?: number;
  social_link?: string;
  userid?: string;
}

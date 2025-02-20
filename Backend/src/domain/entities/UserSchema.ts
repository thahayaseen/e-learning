import Profile from "./Profile";

export default class User{
  constructor(
    
    public name: string,
    public email: string,
    public gid:string|null,
    public profile: Profile,
    public password: string,
    public verified: boolean,
    public role: "admin" | "student" | "mentor",
    public purchasedCourses: string[],
    public subscription: string | null,
  ) {}
}

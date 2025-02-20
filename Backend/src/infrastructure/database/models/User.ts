import mongoose,{Document} from "mongoose";
import IUser from '../../../domain/entities/UserSchema'
export interface IUserModel extends Document,IUser{}
const Profile = new mongoose.Schema({
  avathar: String,
  experience: Number,
  social_link: String,
  userid: String,
});

export const User = new mongoose.Schema<IUserModel>({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: String,
  profile: Profile,
  gid:String,
  email:String,
  password: String,
  verified: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["admin", "student", "mentor"],
    require: true,
  },
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
},{timestamps:true});
export default mongoose.model("User", User);

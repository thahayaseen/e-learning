import mongoose from "mongoose";
import { Imentorrequst } from "../../repositories/beaMentorRepositroy";
const MentorRequst = new mongoose.Schema({
  fullname: { type: String },
  email: {
    type: String,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  idProof: {
    type: String,
  },
  mobile: { type: String },
  qualification: {
    type: String,
  },
  experience: {
    type: Number,
  },
  profileLink: {
    type: String,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  status:{
    type:String,
    enum:['pending','rejected','accepted'],
    default:'pending'
  },
},{timestamps:true});
export default mongoose.model<Imentorrequst>("Beamentor", MentorRequst);

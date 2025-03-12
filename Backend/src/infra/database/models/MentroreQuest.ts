import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  profession: { type: String, required: true },
  experience: { type: String, required: true }, 
  areasOfExpertise: { type: [String], default: [] },
  availability: { type: String, required: true },
  motivation: { type: String, required: true },
  resume: { type: String, default: null }, 
  profileImage: { type: String, default: null }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Request", RequestSchema);

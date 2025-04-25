import mongoose from "mongoose";

const mongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODBLINK!);
 
  } catch (error) {
 
  }
};
export default mongo;

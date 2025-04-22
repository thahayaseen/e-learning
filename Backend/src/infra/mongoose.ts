import mongoose from "mongoose";

const mongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODBLINK!);
    console.log("mongodb connected");
  } catch (error) {
    console.log(error);
  }
};
export default mongo;

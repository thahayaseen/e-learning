import mongoose from "mongoose";

const mongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODBLINK!);
    console.log("mongodb conneced success");
  } catch (error) {}
};
export default mongo;

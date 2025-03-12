import mongoose from 'mongoose'

const mongo=async()=>{
   try {
    await mongoose.connect("mongodb://127.0.0.1:27017/pracitse")
    console.log("mongodb connected");
    
   } catch (error) {
    console.log(error);
    
   }
}
export default mongo
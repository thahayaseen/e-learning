import mongoose from 'mongoose'

const mongo=async()=>{
   try {
    await mongoose.connect("mongodb+srv://thaha:thahaha@socialmedia.ifra0aw.mongodb.net/?retryWrites=true&w=majority&appName=socialmedia")
    console.log("mongodb connected");
    
   } catch (error) {
    console.log(error);
    
   }
}
export default mongo
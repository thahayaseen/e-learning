import express from 'express'
import router from './presentation/routers/user'
import mongo from './infrastructure/database/mongoose'
import morgan from 'morgan'
import dotenv from "dotenv";
import cores from 'cors'
import path from 'path'
import cookieparser from 'cookie-parser'
const app=express()
dotenv.config();

app.use(express.static(path.join(__dirname,'public')))
app.use(cores({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }))
app.use(express.json())
app.use(cookieparser())
mongo()
app.get('/',(req,res)=>{
    res.status(200).json({successed:true})
    return 
})
app.use('/',router)
app.use(morgan("dev"))
app.listen(4050,()=>{
    console.log('setver started');
    
})
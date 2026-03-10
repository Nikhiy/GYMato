import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import cors from 'cors'
const app=express()

dotenv.config()
app.use(express.json());
app.use(cors());

app.listen(process.env.PORT,()=>{
    console.log(`rider service is running on port ${process.env.PORT}`)
    connectDB()
})
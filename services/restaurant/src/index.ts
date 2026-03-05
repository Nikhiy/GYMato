import express from 'express'
import connectDB from './config/db.js';
import dotnev from 'dotenv'
import restaurantRoutes from "./routes/restaurant.js"
import cors from 'cors'
import itemRoutes from './routes/menuitems.js'
import cartRoutes from './routes/cart.js'

dotnev.config()

const app=express()

app.use(cors());
app.use(express.json());

const PORT=process.env.PORT || 5001;
app.use("/api/restaurant",restaurantRoutes)
app.use("/api/item",itemRoutes)
app.use("/api/cart",cartRoutes)

app.listen(PORT,()=>{
    console.log(`Restaurant service is running on port ${PORT}`)
    connectDB();
})
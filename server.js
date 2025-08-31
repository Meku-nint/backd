import express from "express";
import connectDB from "./config/db.js";
import orderRoute from '.controllers/userRoute.js';
import dotenv from "dotenv";
dotenv.config();
connectDB();
const app=express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/orders", orderRoutes);
const PORT =process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`The server running on port ${PORT}`);
});
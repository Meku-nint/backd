import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import useRoutes from "./routes/useRoutes.js";
dotenv.config();
connectDB();
const app=express();
app.use(cors());
app.use(express.json());
app.use("/api",useRoutes);
const PORT =process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`The server running on port ${PORT}`);
});
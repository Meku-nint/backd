import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import useRoutes from "./routes/useRoutes.js";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: ["https://ylakun-43gr.vercel.app","https://dvmanager-95du.vercel.app","https://prov-gilt.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", useRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

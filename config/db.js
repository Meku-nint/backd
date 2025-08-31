import mongoose from "mongoose";
const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI,{
               useNewUrlParser: true,
               useUnifiedTopology: true
        });
        console.log("Mongo is connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);

    }
}
export default connectDB;
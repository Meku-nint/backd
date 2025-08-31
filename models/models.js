import mongoose from "mongoose";
const orderSchema=new mongoose.Schema({
    departure:{
        type:String,required:true
    },
    destination:{
        type:String,required:true
    }, 
     weight:{
        type:String,required:true
    },
    phone:{
        type:String,required:true
    },
     detail:{
        type:String,required:true
    }
},{timestamps:true});
const Order=mongoose.model("Order",orderSchema);
export default Order;
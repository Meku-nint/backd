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
    },
    orderID:{
        type:Number,required:true
    },
   status: {
    type: String,
    enum: [
      "Pending",
      "Confirmed",
      "Assigned",
      "Picked Up",
      "In Transit",
      "Out for Delivery",
      "Delivered",
    ],
    default: "Pending",
  }
},{timestamps:true});
const Order=mongoose.model("Order",orderSchema);
export default Order;
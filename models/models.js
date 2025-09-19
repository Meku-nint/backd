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
    payed:{
        type:Boolean,
        default:false
    },
    fee:{
        type:Number,
        required:true
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
const riderSchema=new mongoose.Schema({
    riderName:{
        type:String,required:true
    },
    riderEmail:{
        type:String,required:true
    },
    phone:{
          type:String,required:true
    },
    file:{
    type:String
    },
    password:{
        type:String,required:true
    },
},{timestamps:true});
const priceSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  weight: {
    type: String,
    required: true
  }
});

const Price = mongoose.model("Price",priceSchema);
const Order=mongoose.model("Order",orderSchema);
const Rider=mongoose.model("Rider",riderSchema);
export default {Price,Order,Rider};
import express from "express"
import Order from "../models/models.js";
export const newOrders =async(req,res)=>{
    const {departure,destination,weight,phone,detail}=req.body;
    console.log(departure,destination,weight,phone,detail);
}
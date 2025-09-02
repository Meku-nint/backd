import express from "express"
import Order from "../models/models.js";
export const newOrders =async(req,res)=>{
    const {departure,destination,weight,phone,detail}=req.body;
    try {
        if(!departure ||!destination||!weight||!phone||!detail){
            return res.status(400).json({
                error:"All fields are required",
                missing:{
                    departure:!departure,
                    destination:!destination,
                    weight:!weight,
                    phone:!phone,
                    detail:!detail,
                
                }
            });
        }
        const order =new Order ({departure, destination, weight, phone, detail });
        await order.save();
        return res.status(201).json({message:"order is successful submitted"});
    } catch (error) {
        return res.status(500).json({error:error.message});
    }
}
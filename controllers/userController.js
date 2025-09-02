import express from "express"
import {Order,Rider} from "../models/models.js";
export const newOrders =async(req,res)=>{
    const orderID=Math.floor(Math.random()*100000);
    const {departure,destination,weight,phone,detail}=req.body;
    try {
        if(!departure ||!destination||!weight||!phone||!detail ||!fee){
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
        const order =new Order ({departure, destination, weight, phone, detail,orderID});
        await order.save();
        return res.status(201).json({message:`order is successful submitted copy your order ID , ${orderID}`});
    } catch (error) {
        return res.status(500).json({error:error.message});
    }
}
export const newRider=async(req,res)=>{
        const password=Math.floor(Math.random()*10000000);
        const {riderName,riderEmail,phone,file}=req.body;
        try {
            if(!riderEmail||!riderName||!phone){
                res.status(400).json({error:"All fields are required"});
            }
            const rider =new Rider({riderName,riderEmail,phone,file,password});
            await rider.save();
            return res.status(201).json({message:"The rider add succesfully"});
        } catch (error) {
        return res.status(500).json({error:error.message});
        }
}
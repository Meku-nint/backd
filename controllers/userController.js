import express from "express"

import multer from "multer";
import path from "path";
import models  from "../models/models.js";
const {Price,Order,Rider,Balance} =models;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

export const newOrders =async(req,res)=>{
    const orderID=Math.floor(Math.random()*100000);
    const {departure,destination,weight,phone,detail,fee}=req.body;
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
    const order =new Order ({departure, destination, weight, phone, detail,fee,orderID});
        await order.save();
        return res.status(201).json({message:`order is successful submitted copy your order ID , ${orderID}`});
    } catch (error) {
        return res.status(500).json({error:error.message});
    }
}
export const newRider = async (req, res) => {
  const password = Math.floor(Math.random() * 10000000);

  const { riderName, riderEmail, phone,account,filled} = req.body;
  console.log(req.body);
  const file = req.file ? req.file.filename : null;

  try {
    if (!riderEmail || !riderName || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const rider = new Rider({
      riderName,
      riderEmail,
      phone,
      file,
      password,
      account
    });

    await rider.save();
    const balance = new Balance({userId:rider._id,Name:rider.riderName});
    await balance.save();
    return res.status(201).json({ message: "The rider added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const setPrice = async (req, res) => {
  const { price, weight } = req.body;

  if (!weight || !price) {
    return res.status(400).json({
      error: "All fields are required",
      missing: {
        weight: !weight,
        price: !price,
      },
    });
  }

  try {
    const newPrice = new Price({ price,weight });
    await newPrice.save();
    return res.status(201).json({ message: "Price set successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
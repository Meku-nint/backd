import multer from "multer";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import path from "path";
import models  from "../models/models.js";
const {Price,Order,Rider,Balance,deliveredOrder,Manager} =models;
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
        return res.status(201).json({message:`order is successful submitted copy your order ID it helps u to track your order, ${orderID}`});
    } catch (error) {
        return res.status(500).json({error:error.message});
    }
}
export const newRider = async (req, res) => {
  const password = Math.floor(Math.random() * 10000000);
  const { riderName, riderEmail, phone,account,filled} = req.body;
  const hashedPassword = await bcrypt.hash(password.toString(), 10);
  const riderExists = await Rider.findOne({ riderEmail});
  if (riderExists) {
    return res.status(400).json({ error: "Rider with this email already exists" });
  }
  
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
      password: hashedPassword,
      account
    });

    await rider.save();
    const balance = new Balance({userId:rider._id,Name:rider.riderName,account:rider.account});
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
export const getOrders =async (req,res)=>{
  try {
const orders = await Order.find({ status: { $ne: "Completed" } }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({error:error.message});
  }
}

export const updateOrders= async (req,res) => {
  const { orderID,newStatus,name,riderID} = req.body;
  if (!orderID || !newStatus||!name||!riderID) {
    return { error: "Order ID and new status are required" };
  }
  try {
    const order = await Order.findOne({ orderID });
    if (!order) {
      return { error: "Order not found" };
    }
    order.status = newStatus;
    order.rider=name;

    if(newStatus==="Completed"){
      const createdDate=new Date().toLocaleDateString();
      const delivered=new deliveredOrder({
        riderName:name,
        orderID:order.orderID,
        Payment:order.fee,
        Tip:order.tip,
        createdDate
      });
      await delivered.save();
      const balanceRecord=await Balance.findOne({userId:riderID});
      if(balanceRecord){
        balanceRecord.balance+=order.fee;
        await balanceRecord.save();
      }
      const updateBalance=await Rider.findOne({_id:riderID});
      if(updateBalance){
        updateBalance.balance+=order.fee;
        await updateBalance.save();
      }
    }
    await order.save();
    return res.status(200).json({ message: "Order status successfully updated" });
  } catch (error) {
    return { error: error.message };
  }
};
export const loginRider=async(req,res)=>{
  const {email,password}=req.body;
  try {
    const rider=await Rider.findOne({riderEmail:email});
    if(!rider){
      return res.status(404).json({error:"Rider not found"});
    }
    const isMatch= await bcrypt.compare(password,rider.password);
    if(!isMatch){
      return res.status(401).json({error:"Invalid password"});
    }
    const token=jwt.sign({
      id:rider._id,
      email:rider.riderEmail,
      name:rider.riderName
    },process.env.SECRET_KEY,{expiresIn:'5d'});
    return res.status(200).json({message:"Login successful",token});
  } catch (error) {
    return res.status(500).json({error:error.message});
  }
}
export const loginManager=async(req,res)=>{
  const {userName,password}=req.body;
  try {
    const manager=await Manager.findOne({userName});
    if(!manager){
      throw new Error("Manager not found");
    }
 const isMatch= await bcrypt.compare(password,manager.password);
    if(!isMatch){
      throw new Error("Invalid password");
    }
    const managerToken=jwt.sign({
      id:manager._id,
      name:manager.userName,
      access:manager.access
    },process.env.SECRET_KEY_MANAGER,{expiresIn:'5d'});
    return res.status(200).json({message:"Login successful",managerToken});
  } catch (error) {
    return res.status(500).json({error:error.message});
  }
}
export const addManager=async(req,res)=>{
  const {userName,password}=req.body;
  try {
     if(!userName||!password){
    return res.status(404).json({message:"All fields are required"});
  }
  const hashed = await bcrypt.hash(password.toString(), 10);
     const managerExist = await Manager.findOne({ userName});
  if (managerExist) {
    return res.status(400).json({ error: "Manager with this email already exists" });
  }
  const newManager=new Manager({
    userName,
    password:hashed
  })
   await newManager.save();
   return res.status(201).json({ message: "The Manager added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
export const getProfile =async(req,res)=>{
  try {
    const riderId=req.user.id;
    const rider=await Rider.findById(riderId).select('-password');
    if(!rider){
      return res.status(404).json({error:"There is no rider in this data"});
    }
    return res.status(200).json(rider);
  } catch (error) {
    res.status(500).json({error:error.message});
  }
}
export const deliveredOrders = async (req, res) => {
  try {
    const riderName = req.user.name; 
    const createdDate =new Date().toLocaleDateString();
    const orders = await deliveredOrder.find({
      riderName,
      createdDate
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching delivered orders",
    });
  }
};
export const riderBalance=async(req,res)=>{
  try {
    const ridersBalance=await Balance.find();
    return res.status(200).json(ridersBalance);
  } catch (error) {
    return res.status(500).json({error:error.message});
  }
}

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import models  from "../models/models.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const {Price,Order,Rider,Balance,Email,deliveredOrder,Manager} =models;
export const newRider = async (req, res) => {
  const password = 111111;
  const { riderName, riderEmail, phone, account } = req.body;

  try {
    if (!riderEmail || !riderName || !phone || !account) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const riderExists = await Rider.findOne({ riderEmail });
    if (riderExists) {
      return res.status(400).json({ error: "Rider with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password.toString(), 10);
    const rider = new Rider({
      riderName,
      riderEmail,
      phone,
      password: hashedPassword,
      account,
    });
    await rider.save();
    const balance = new Balance({
      userId: rider._id,
      Name: rider.riderName,
      account: rider.account,
    });
    await balance.save();
    const newEmail = new Email({ email: riderEmail });
    await newEmail.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Delivery App" <${process.env.EMAIL_USER}>`,
      to: riderEmail,
      subject: "🚴Welcome to Delivery App — Your Account Details",
      html: `
        <h2>Welcome aboard, ${riderName}!</h2>
        <p>We’re excited to have you as part of our delivery team.</p>
        <p>Here are your login details:</p>
        <ul>
          <li><strong>Email:</strong> ${riderEmail}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Please log in <a href="https://u.com">here</a> and change your password as soon as possible for security reasons.</p>
        <p> <strong>Let’s start delivering!</strong></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(201).json({ message: "Rider added and email sent successfully!" });
  } catch (error) {
    console.error("❌ Error in newRider:", error);
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

export const payRider = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Rider ID is required" });
  }
  try {

    const balanceRecord = await Balance.findOne({ userId});
    if (!balanceRecord) {
      

      return res.status(404).json({ error: "Balance record not found" });
    }
    if (balanceRecord.status === "paid") {
      return res.status(400).json({ error: "Rider has already been paid" });
    }
    balanceRecord.status = "paid";
    balanceRecord.balance = 0;
    await balanceRecord.save();
    return res.status(200).json({ message: "Rider payment successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
export const ridersProfile=async(req,res)=>{
  try {
    const riders=await Rider.find().select('-password');
    if(!riders){ 
      return res.status(404).json({error:"There is no rider in this data"});
    }
    return res.status(200).json(riders);
  } catch (error) {
    res.status(500).json({error:error.message});
  }
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendOrderEmail = async (riderEmails, orderDetails) => {
  try {
    const mailOptions = {
      from: `"Delivery App" <${process.env.EMAIL_USER}>`,
      to: riderEmails,
      subject: "🚨 New Order Alert!",
      html: `
        <h2>🚴 New Order Available!</h2>
        <p>A new order has just been placed. Please check your dashboard to accept it.</p>
        <p><strong>Order Summary:</strong></p>
        <ul>
          <li>From: ${orderDetails.from}</li>
          <li>To: ${orderDetails.to}</li>
          <li>Price: ${orderDetails.price} Birr</li>
          <p>Click <a href="http://localhost:3000/rider/login">here</a> to login and view the order details.</p>
        </ul>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

  } catch (error) {

    console.error("Error sending email:", error);
  }
};
export const newOrders = async (req, res) => {
  const orderID = Math.floor(Math.random() * 100000);
  const { departure, destination, weight, phone, detail, fee } = req.body;

  try {
    if (!departure || !destination || !weight || !phone || !detail || !fee) {
      return res.status(400).json({
        error: "All fields are required",
        missing: {
          departure: !departure,
          destination: !destination,
          weight: !weight,
          phone: !phone,
          detail: !detail,
        },
      });
    }
    const order = new Order({ departure, destination, weight, phone, detail, fee, orderID });
    await order.save();
    const riders = await Email.find({}, "email");
    const riderEmails = riders.map((rider) => rider.email);
   const orderDetails = {
  from: departure,
  to: destination,
  price: fee
};
    sendOrderEmail(riderEmails, orderDetails);
    return res.status(201).json({
      message: `Order submitted successfully! Your order ID: ${orderID}`,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const trackOrder = async (req, res) => {
  const { trackingId } = req.params; // get trackingId from URL

  if (!trackingId) {
    return res.status(400).json({ error: "Tracking ID is required" });
  }

  try {
    const order = await Order.findOne({ orderID: trackingId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).json({
      id: order.orderID,
      phone: order.phone,
      status: order.status,
      rider: order.rider,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
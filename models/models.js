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
    
  rider:{
    type:String,
    default:"no one"
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
    default: "Pending",
  }
},{timestamps:true});
const riderSchema=new mongoose.Schema({
    riderName:{
        type:String,required:true
    },
    riderEmail:{
        type:String,required:true,unique:true
    },
    phone:{
          type:String,required:true
    },
    filled:{

    type:String
    },
    password:{
        type:String,required:true
    },
    account:{
        type:String,required:true
    },
    balance:{
        type:Number,
        default:0
    },
    tip:{
        type:Number,
        default:0
    }
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
const deliveredOrderSchema=new mongoose.Schema({
    riderName:{
        type:String,required:true
    },
    orderID:{
        type:Number,required:true
    },Payment:{
        type:Number,required:true,
        default:0
    },
        Tip:{
        type:Number,
        default:0,
        required:true
    },
    createdAt:{
        type:Date,
        default:new Date().toLocaleDateString()
    }
});    
const balanceSchema=new mongoose.Schema({
        userId:{type:mongoose.Schema.Types.ObjectId,ref:"Rider",required:true},
            Name:{type:String,required:true},
                balance:{type:Number,default:0},
                tip:{type:Number,default:0},
                    status:{type:String,default:"unpaid"}
})
const deliveredOrder=mongoose.model("deliveredOrder",deliveredOrderSchema);
const Balance=mongoose.model("Balance",balanceSchema);
const Price = mongoose.model("Price",priceSchema);
const Order=mongoose.model("Order",orderSchema);
const Rider=mongoose.model("Rider",riderSchema);
export default {Price,Order,Rider,Balance,deliveredOrder};
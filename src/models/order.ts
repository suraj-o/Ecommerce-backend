import mongoose from "mongoose";


const schema=new mongoose.Schema({
      shippingInfo:{
        address:{
            type:String,
            requrie:true
        },
        city:{
            type:String,
            requrie:true
        },
        state:{
            type:String,
            requrie:true
        },
        country:{
            type:String,
            requrie:true
        },
        pinode:{
            type:Number,
            requrie:true
        }
      },
      user:{
        type:String,
        ref:"User",
        require:true
      },
      subtotal:{
        type:Number,
        require:true,
        default:0
      },
      shipingCharges:{
        type:Number,
        require:true,
        default:0
      },
      tax:{
        type:Number,
        require:true,
        default:0
      },
      discount:{
        type:Number,
        require:true,
        default:0
      },
      total:{
        type:Number,
        require:true,
      },
      status:{
        type:String,
        enum:["processing","shipped","deliverd","order already deliverd"],
        default:"processing"
      },
      orderItems:[
        {
            name:String,
            photo:String,
            price:Number,
            quantity:Number,
            productId:{
                type:mongoose.Types.ObjectId,
                ref:"Products"
            },
        },
      ]
    },
    {
        timestamps:true
    }
);

export const Order=mongoose.model("Order",schema);

  
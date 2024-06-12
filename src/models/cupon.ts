import mongoose from "mongoose";

interface Coupons extends Document{
    coupon:string;
    amount:number
}

const schema=new mongoose.Schema({
    coupon:{
        type:String,
        require:[true," Please enter coupon code"],
        unique:true
    },
    amount:{
        type:Number,
        require:[true,"Plese enter coupon amount"]
    }
})

export const Coupon=mongoose.model<Coupons>("Coupon",schema)
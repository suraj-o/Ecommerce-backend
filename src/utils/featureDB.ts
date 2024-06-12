import mongoose, { Error } from "mongoose";
import { CalclutePercentage, InvalidateCache, OrderItems } from "../types/types.js";
import { Products } from "../models/products.js";
import { myCache } from "../server.js";
import { Order } from "../models/order.js";


// connecting to the dataBase
export const connectDB=()=>{
    mongoose.connect("mongodb+srv://suraj22:Suraj2226@practice.hx3xaub.mongodb.net",{
        dbName:"ecommerceAPP"
    }).then(c=>console.log(`Connect to ${c.connection.host}`))
    .catch(c=>console.log(c))
}


// fuction for to invalidate the cache memory 
export const invalidateCache=async({product,order,admin,userId}:InvalidateCache)=>{
if(product){
    const productkey:string[]=["latest-product","categories","admin-products"];

    const productId=await Products.find({}).select("_id");
    productId.forEach(i=>{
        productkey.push(`product-${i._id}`)
    })
    
    await myCache.del(productkey)
}
if(order){
    const orderkey:string[]=["allorder",`myorder-${userId}`];
    const order=await Order.find({}).select("_id");

    order.forEach(i=>{
        orderkey.push(`order-${i._id}`)
    })

    await myCache.del(orderkey)
}
if(admin){
    const adminKey:Array<string>=["admin-dasboard-stats","admin-dasboard-pie","admin-bar-chart","admin-line-chart"];
    await myCache.del(adminKey)
}
}


//function for reduse stock 
export const reduseStock=async(orderItems:OrderItems[])=>{
    for(let i=0;i<orderItems.length;i++){
        const order=orderItems[i];
        const product=await Products.findById(order.productId);
        if(!product) throw new Error("product not found");
        product.stock! -= order.quantity;
        await product.save()
    }
}

// function calculate percentages 
export const calclutePercentage:CalclutePercentage=(a,b)=>{
    if(b===0) return (a*100).toFixed(0)
     const percentages=(a/b)*100;
     return percentages.toFixed(0)
}

interface MyDocument{
    createdAt:Date;
}

type MonthData={
    length:number;
    DocArr:MyDocument[];
    property?:"discount" | "total"
}

export const lastMonthsData=({length,DocArr,property}:MonthData)=>{
const lastMonthsData=new Array(length).fill(0);
    const today:Date=new Date();
    DocArr.forEach((i)=>{
        const creationDate=i.createdAt;
        const monthDIff=((today.getMonth() - creationDate.getMonth())+12)%12
        if(monthDIff < length){
            lastMonthsData[length - monthDIff -1]+=1;
      }
    })
    return lastMonthsData
}
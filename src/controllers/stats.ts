import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Products } from "../models/products.js";
import { User } from "../models/user.js";
import { myCache } from "../server.js";
import { calclutePercentage, lastMonthsData } from "../utils/featureDB.js";



export const addminDashboardStats=TryCatch(async(req,res,next)=>{
    // initiallizing data stats vatiable
    let stats;
    
    // taking stats data from cache memory
   if (myCache.has("admin-dasboard-stats")){
    stats=JSON.parse(myCache.get("admin-dasboard-stats")as string)
   }
   // in case of data does'nt exists in cache memory then getting data from database    
   else{
     // getting present date 
     const today=new Date()
     
     //  getting last six month 
    const lastSixMonthAgo=new Date()
    lastSixMonthAgo.setMonth(lastSixMonthAgo.getMonth()-6)
     
     //first and present date of current Month
     const thisMonthFirstDate=new Date(today.getFullYear(),today.getMonth(),1);
     const lastOfMonth=today;
     
     //first and present date of last Month
     const lastMonthfirsteDate=new Date(today.getFullYear(),today.getMonth()-1,1);
     const lastMonthLastDate=new Date(today.getFullYear(),today.getMonth(),0);
 
     //fetching all data from databses 
     const lastMonthProductsPromise= Products.find({
         createdAt:{
             $gte:lastMonthfirsteDate,
             $lte:lastMonthLastDate
         }
     })
     const thisMonthProductsPromise= Products.find({
         createdAt:{
             $gte:thisMonthFirstDate,
             $lte:lastOfMonth
         }
     })
     const lastMonthOrderPromise= Order.find({
         createdAt:{
             $gte:lastMonthfirsteDate,
             $lte:lastMonthLastDate
         }
     })
     const thisMonthOrderPromise= Order.find({
         createdAt:{
             $gte:thisMonthFirstDate,
             $lte:lastOfMonth
         }
     })
     const lastMonthUsersPromise= User.find({
         createdAt:{
             $gte:lastMonthfirsteDate,
             $lte:lastMonthLastDate
         }
     })
     const thisMonthUsersPromise= User.find({
         createdAt:{
             $gte:thisMonthFirstDate,
             $lte:lastOfMonth
         }
     })
 
     const lastSixMonthAgoPromise= Order.find({
         createdAt:{
             $gte:lastSixMonthAgo,
             $lte:today
         }
     })
 
 
     // fetching all promises with help of Promise.all to reduce fetching time
     const [lastMonthProducts,thisMonthProducts,
            lastMonthOrders,thisMonthOrders,
            lastMonthUsers,thisMonthUsers,
            productCount,userCount,
            orderCount,lastSixMonthData,categories,femaleUserCount,
            latestOrders
         ]=await Promise.all([
         lastMonthProductsPromise,
         thisMonthProductsPromise,
         lastMonthOrderPromise,
         thisMonthOrderPromise,
         lastMonthUsersPromise,
         thisMonthUsersPromise,
         Products.countDocuments(),
         User.countDocuments(),
         Order.find({}).select("total"),
         lastSixMonthAgoPromise,
         Products.distinct("category"),
         User.countDocuments({gender:"female"}),
         Order.find({}).select(["_id","total","discount","orderItems"]).limit(5),
     ])

        // calclutaing current and last month revenue
        const thisMonthRevenue=thisMonthOrders.reduce((total,order)=>total+order.total!,0)
        const lastMonthRevenue=lastMonthOrders.reduce((total,order)=>total+order.total!,0)
    
        //  calclutaing entire revenue
        const Revenue=orderCount.reduce((total,order)=>total+order.total!,0)

        // calclutaing percentage
     const percent={
         revnue:calclutePercentage(thisMonthRevenue,lastMonthRevenue),
         product:calclutePercentage(thisMonthProducts.length,lastMonthProducts.length),
         order:calclutePercentage(thisMonthOrders.length,lastMonthOrders.length),
         user:calclutePercentage(thisMonthUsers.length,lastMonthUsers.length),
     }

    //  Array of last six month order data
    const lastSixMonthTotalOrders=new Array(6).fill(0);
    const lastSixMonthOrdersRevenue=new Array(6).fill(0);

      lastSixMonthData.forEach((order)=>{
          const creationDate:Date=order.createdAt;
          const monthDIff=((today.getMonth() - creationDate.getMonth())+12)%12
          if(monthDIff < 6){
            lastSixMonthTotalOrders[6 - monthDIff-1]+=1;
            lastSixMonthOrdersRevenue[6 - monthDIff-1]+=order.total!;
        }
      })

    //  counting document of product,order,user
       const count={
        Revenue,
        products:productCount,
        users:userCount,
        order:orderCount.length
       }
       
    //   category inventory
    const categoryCountPromise=categories.map((category)=>Products.countDocuments({category}));
    const categoryCount= await Promise.all(categoryCountPromise)

     const categoriesData:Record<string,number>[]=[];
     categories.forEach((category,i)=>{
        categoriesData.push({
            [category!]:Math.round((categoryCount[i] / productCount) * 100)
        })
    })

    // gender Ratio

    const genderRation={
        male:userCount-femaleUserCount,
        female:femaleUserCount
    }

    // latest orders

    const latestOrderList=latestOrders.map((i,index)=>{
        return{
         
        _id:i._id,
        discount:i.discount,
        total:i.total,
        quantity:i.orderItems.length

    }})

     // passing data to stats
     stats={
        categoriesData,
        genderRation,
         percent,
         count,
         lastSixMonth:{
            orders:lastSixMonthTotalOrders,
            revenue:lastSixMonthOrdersRevenue
         },
         latestOrderList
     }
    //  storing data in cache memory
       myCache.set("admin-dasborad-stats",JSON.stringify(stats))
    }
    // returning data
    res.status(200).json({
        success:true,
        stats
    })
})

export const pieChart=TryCatch(async(req,res,next)=>{
    // initiallizing data stats vatiable
    let charts;
    
    // taking stats data from cache memory
    
    if(myCache.has("admin-dasboard-pie")){
        charts=JSON.parse(myCache.get("admin-dasboard-pie") as string)
    }
   // in case of data does'nt exists in cache memory then getting data from database    
    else{
        const [processCount,sippedCount,deliverdCount,
            productCount,categories,productOutStock,
        roleCount,userDOB]= await Promise.all([
           Order.countDocuments({status:"processing"}),
           Order.countDocuments({status:"shipped"}),
           Order.countDocuments({status:"deliverd"}),
           Products.countDocuments(),
           Products.distinct("category"),
           Products.find({stock:{$lte:0}}),
           User.find({}).select("role"),
           User.find({}).select("dob")
        ])


            //   category inventory
         const categoryCountPromise=categories.map((category)=>Products.countDocuments({category}));
         const categoryCount= await Promise.all(categoryCountPromise)

         const categoriesData:Record<string,number>[]=[];
         categories.forEach((category,i)=>{
          categoriesData.push({
            [category!]:Math.round((categoryCount[i] / productCount) * 100)
          })
            })
            
            // stauts ratio count
            const status={
                processCount,
                sippedCount,
                deliverdCount
            };

            // product stock ratio
            const stock={
                inStock:productCount - productOutStock.length,
                outStock:productOutStock.length
            }

            // admin & user Count 
            const userCounts={
                adminCount:roleCount.filter((role)=>role.role==="admin").length,
                userCount:roleCount.filter((role)=>role.role==="user").length
            }

            // age group
            const userAgeGroup={
                    teen:userDOB.filter((i)=>i.age<20).length,
                    adult:userDOB.filter((i)=>i.age >= 20 &&i.age <=40).length,
                    old:userDOB.filter((i)=>i.age>40).length
                }

            // actual pie charts
            charts={
                status,
                categoriesData,
                stock,
                userCounts,
                userAgeGroup
            };
        myCache.set("admin-dasboard-pie",JSON.stringify(charts));
    }
    res.status(200).json({
        success:true,
        charts
    })        
})

export const BarChart=TryCatch(async(req,res,next)=>{
    let charts;

    if(myCache.has("admin-bar-chart")) charts=JSON.parse(myCache.get("admin-bar-chart")as string)
    else{
        const today=new Date();

        const lastSixMonthAgo=new Date()
        lastSixMonthAgo.setMonth(lastSixMonthAgo.getMonth()-6)

        const twelveMonthAgo=new Date()
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth()-12)

        const lastSixMonthUserPromise= User.find({
            createdAt:{
                $gte:lastSixMonthAgo,
                $lte:today
            }
        }).select("createdAt")
        
        const lastSixMonthProductsPromise= Products.find({
            createdAt:{
                $gte:lastSixMonthAgo,
                $lte:today
            }
        }).select("createdAt")

        const twelveMonthOrderPromise= Order.find({
            createdAt:{
                $gte:twelveMonthAgo,
                $lte:today
            }
        }).select(["createdAt"])
        
          
        
          const [lastSixMonthUser,
                lastSixMonthProducts,
                twelveMonthOrder]=await Promise.all([
                lastSixMonthUserPromise,
                lastSixMonthProductsPromise,
                twelveMonthOrderPromise])

        const sixMonthUser=lastMonthsData({length:6,DocArr:lastSixMonthUser});
        const sixMonthProducts=lastMonthsData({length:6,DocArr:lastSixMonthProducts});
        const twelveMonthOrderData=lastMonthsData({length:12,DocArr:twelveMonthOrder,});
            console.log(twelveMonthOrder)
        charts={
            sixMonthUser,
            sixMonthProducts,
            twelveMonthOrderData
        }

        myCache.set("admin-bar-chart",JSON.stringify(charts))
    }


    res.status(200).json({
        success:true,
        charts
    })     
})

export const LineChart=TryCatch(async(req,res,next)=>{
    let charts;

    if(myCache.has("admin-line-chart")) charts=JSON.parse(myCache.get("admin-line-chart")as string)
    else{
        const today=new Date();

        const twelveMonthAgo=new Date()
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth()-12)


       const baseQuerry={
            createdAt:{
                $gte:twelveMonthAgo,
                $lte:today
            }
        }

          const [ twelvexMonthUser,
                twelveMonthProducts,
                twelveeMonthOrder]=await Promise.all([
                User.find({baseQuerry}).select("createdAt"),
                Products.find({baseQuerry}).select("createdAt"),
                Order.find({baseQuerry}).select(["createdAt","discount","total"])
            ])

        const twelveMonthUserData=lastMonthsData({length:12,DocArr:twelvexMonthUser});
        const twelveMonthProductsData=lastMonthsData({length:12,DocArr:twelveMonthProducts});
        const twelveMonthOrderData=lastMonthsData({length:12,DocArr:twelveeMonthOrder});
            console.log(twelveeMonthOrder)
        charts={
            twelveMonthUserData,
            twelveMonthProductsData,
            twelveMonthOrderData
        }

        myCache.set("admin-line-chart",JSON.stringify(charts))
    }


    res.status(200).json({
        success:true,
        charts
    })     
})
import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/Error.js";
import { TryCatch } from "../middlewares/error.js";




export const NewUser=TryCatch(async(
    req:Request<{},{},NewUserRequestBody>,
    res:Response,
    next:NextFunction
    ) => {
       const {name,email,gender,dob,_id,photo} = req.body;

       let user =await User.findById({_id})
       
       if(user)
       return res.status(200).json({
      success:true,
      message:`welcome ${user.name}`
   })
   
       if(!name || !email || !gender || !photo || !dob || !_id) return next(new ErrorHandler("please fill the all require things",401))

       user = await User.create({
        _id,
        name,
        email,
        photo,
        gender,
        dob:new Date(dob),
       })

       res.status(201).json({
        succes:true,
        message:`${user.name}welcome to our world`
       })
    }
)

export const getAllUers=TryCatch(async(req,res,next)=>{
   const user=await User.find({});

   res.status(200).json({
      success:true,
      user,

   })
})

 export const deleteUser=TryCatch(async(req,res,next)=>{
    const{id}=req.params;
    const user =await User.findById(id)

    if(!user) return next(new ErrorHandler("invalid id",400))

    await user.deleteOne()

    res.status(201).json({
       success:true,
       message:"user deleted succuessFully"
    })
 })

 export const getUserId=TryCatch(async(req,res,next)=>{
 const{id}=req.params;

 const user =await User.findById(id)
 
 if(!user) return next(new ErrorHandler("invalid id",400))
 res.status(201).json({
    success:true,
    user
 })
 })
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/Error.js";
import { TryCatchFuc } from "../types/types.js";

export const errorMiddlewere=(
    err:ErrorHandler,
    req:Request,
    res:Response,
    next:NextFunction
    ) => {
        
    err.message||="internal server error";
    err.status||=500;
    
    return res.status(err.status).json({
        succes:false,
        message:err.message
    })
}

export const TryCatch=(func:TryCatchFuc)=>(req:Request,res:Response,next:NextFunction)=>{
    return Promise.resolve(func(req,res,next)).catch(next)
}
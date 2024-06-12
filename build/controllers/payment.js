import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/cupon.js";
import { stripe } from "../server.js";
import ErrorHandler from "../utils/Error.js";
export const newCoupon = TryCatch(async (req, res, next) => {
    const { coupon, amount } = req.body;
    if (!coupon || !amount)
        return next(new ErrorHandler("Please all feilds", 400));
    await Coupon.create({ coupon, amount });
    res.status(201).json({
        success: true,
        message: `Coupon ${coupon} created SuccessFully`
    });
});
export const create = TryCatch(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount)
        return next(new ErrorHandler("Please add amount", 400));
    const createIntent = stripe.paymentIntents.create({
        amount,
        currency: "inr"
    });
    res.status(201).json({
        success: true,
        clint: (await createIntent).client_secret
    });
});
export const applyDiscount = TryCatch(async (req, res, next) => {
    const { coupon } = req.query;
    const discount = await Coupon.findOne({ coupon });
    if (!discount)
        return next(new ErrorHandler("Invalid ID", 404));
    res.status(201).json({
        success: true,
        discount: discount.amount
    });
});
export const getAllCoupon = TryCatch(async (req, res, next) => {
    const coupon = await Coupon.find({});
    if (!coupon)
        return next(new ErrorHandler("no coupons yet", 404));
    res.status(201).json({
        success: true,
        coupon
    });
});
export const getSingleCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon)
        return next(new ErrorHandler("Invalid ID", 404));
    res.status(201).json({
        success: true,
        coupon
    });
});
export const deleteSingleCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon)
        return next(new ErrorHandler("Invalid ID", 404));
    res.status(201).json({
        success: true,
        message: `deleted successFully`
    });
});

import express from "express";
import isAdmin from "../middlewares/admin.js";
import { applyDiscount, create, deleteSingleCoupon, getAllCoupon, getSingleCoupon, newCoupon } from "../controllers/payment.js";
const payment = express.Router();
payment.post("/create", create);
payment.post("/newcoupon", isAdmin, newCoupon);
payment.get("/coupon", applyDiscount);
payment.get("/coupon/all", isAdmin, getAllCoupon);
payment.route("/coupon/:id").get(isAdmin, getSingleCoupon)
    .delete(isAdmin, deleteSingleCoupon);
export default payment;

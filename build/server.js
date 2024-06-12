import express, { urlencoded } from "express";
import { connectDB } from "./utils/featureDB.js";
import { errorMiddlewere } from "./middlewares/error.js";
import NodeCache from "node-cache";
import morgan from "morgan";
import { config } from "dotenv";
import Stripe from "stripe";
import cors from "cors";
const server = express();
config({
    path: "./.env"
});
connectDB();
export const stripe = new Stripe(process.env.STRIPE_SEC);
export const myCache = new NodeCache();
//using middleweres
server.use(morgan("dev"));
server.use(express.json());
server.use(urlencoded({ extended: true }));
server.use(cors());
// {
//     origin:process.env.FRONTEND_URL,
//     methods:["GET","POST","PUT","DELETE"]
// }
// import routers
import User from "./routes/user.js";
import Order from "./routes/order.js";
import Payment from "./routes/payment.js";
import Product from "./routes/products.js";
import Stats from "./routes/stats.js";
// mongodb+srv://suraj22:Suraj2226@practice.hx3xaub.mongodb.net/
server.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "all ok server is working in good condition"
    });
});
// Using routes
// server.use("/api/v4/user",User)
server.use("/api/v3/user", User);
server.use("/api/v3/product", Product);
server.use("/api/v3/order", Order);
server.use("/api/v3/payment", Payment);
server.use("/api/v3/admin", Stats);
server.use("/uploads", express.static("uploads"));
// using custom error middlewere
server.use(errorMiddlewere);
server.listen(process.env.PORT, () => {
    console.log(`server is working on http://localhost:${process.env.PORT}`);
});

import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/Error.js";
import { Products } from "../models/products.js";
import { rm } from "fs";
import { myCache } from "../server.js";
import { invalidateCache } from "../utils/featureDB.js";
export const newProduct = TryCatch(async (req, res, next) => {
    console.log(1);
    const { name, category, price, stock } = req.body;
    console.log(1);
    const photo = req.file;
    console.log(1);
    if (!photo)
        return next(new ErrorHandler("please add photo", 400));
    console.log(1);
    if (!name || !category || !price || !stock)
        return next(new ErrorHandler("please fill all fields", 400));
    console.log(1);
    if (!name || !category || !price || !stock) {
        console.log(1);
        rm(photo.path, () => {
            console.log("deleted");
        });
    }
    console.log(1);
    await Products.create({
        name,
        category,
        price,
        stock,
        photo: photo.path
    });
    console.log(1);
    invalidateCache({ product: true, admin: true, });
    console.log(1);
    res.status(201).json({
        success: true,
        message: "products add successfully"
    });
});
export const getlatestProducts = TryCatch(async (req, res, next) => {
    let product;
    if (myCache.has("latest-product")) {
        product = JSON.parse(myCache.get("latest-product"));
    }
    else {
        product = await Products.find({}).sort({ createdAt: -1 }).limit(5);
        myCache.set("latest-product", JSON.stringify(product));
    }
    res.status(200).json({
        success: true,
        product
    });
});
export const getAllCategories = TryCatch(async (req, res, next) => {
    let categories;
    console.log(1);
    if (myCache.has("categories")) {
        console.log(2);
        categories = JSON.parse(myCache.get("categories"));
    }
    else {
        console.log(3);
        categories = await Products.distinct("category");
        myCache.set("categories", JSON.stringify(categories));
        console.log(4);
    }
    console.log(5);
    console.log(categories);
    res.status(200).json({
        success: true,
        categories
    });
});
export const adminProducts = TryCatch(async (req, res, next) => {
    let product;
    if (myCache.has("admin-products")) {
        product = JSON.parse(myCache.get("admin-products"));
    }
    else {
        product = await Products.find({});
        myCache.set("admin-products", JSON.stringify(product));
    }
    res.status(200).json({
        success: true,
        product
    });
});
export const getSingleProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    let product;
    if (myCache.has(`product-${id}`)) {
        product = JSON.parse(myCache.get(`product-${id}`));
    }
    else {
        product = await Products.findById(id);
        if (!product)
            return next(new ErrorHandler("Invalid id", 404));
        myCache.set(`product-${id}`, JSON.stringify(product));
    }
    res.status(200).json({
        success: true,
        product
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;
    const photo = req.file;
    const product = await Products.findById(id);
    if (!product)
        return next(new ErrorHandler("Invalid ID", 404));
    if (photo) {
        rm(product.photo, () => {
            console.log("old photo deleted");
        });
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    if (photo)
        product.photo = photo.path;
    await product.save();
    invalidateCache({ product: true });
    res.status(201).json({
        success: true,
        message: "products update successfully"
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const product = await Products.findById(req.params.id);
    if (!product)
        return next(new ErrorHandler("Invalid id", 404));
    rm(product.photo, () => {
        console.log("deleted");
    });
    await product.deleteOne();
    invalidateCache({ product: true });
    res.status(200).json({
        success: true,
        message: "products deleted successfully"
    });
});
export const getAllProducts = TryCatch(async (req, res, next) => {
    const { search, sort, price, category } = req.query;
    const page = Number(req.query.page);
    const limit = Number(process.env.PAGE_LIMIT || 8);
    const skip = (page - 1) * limit;
    const baseQuerry = {};
    if (search) {
        baseQuerry.name = {
            $regex: search,
            $options: "i"
        };
    }
    ;
    if (price) {
        baseQuerry.price = {
            $lte: Number(price)
        };
    }
    ;
    if (category)
        baseQuerry.category = category;
    // calling multiple api in one time
    const [filteredProduct, product] = await Promise.all([
        // calling filteredProduct Promise
        Products.find(baseQuerry)
            .sort(sort && { price: sort == "asc" ? 1 : -1 }).limit(limit).skip(skip),
        //calling product Promise  
        Products.find({})
    ]);
    const totalPages = Math.ceil(product.length / limit);
    res.status(200).json({
        success: true,
        filteredProduct,
        totalPages
    });
});

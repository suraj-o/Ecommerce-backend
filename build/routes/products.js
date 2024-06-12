import express from "express";
import isAdmin from "../middlewares/admin.js";
import { singleUpload } from "../middlewares/multer.js";
import { adminProducts, deleteProduct, getAllCategories, getAllProducts, getSingleProduct, getlatestProducts, newProduct, updateProduct } from "../controllers/productController.js";
const product = express.Router();
product.post("/newproduct", isAdmin, singleUpload, newProduct);
product.get("/latest", getlatestProducts);
product.get("/categories", getAllCategories);
product.get("/admin-products", isAdmin, adminProducts);
product.route("/:id").get(getSingleProduct)
    .put(isAdmin, singleUpload, updateProduct)
    .delete(isAdmin, deleteProduct);
product.get("/all/products", getAllProducts);
export default product;

import express from "express";
import { NewUser, deleteUser, getAllUers, getUserId, } from "../controllers/userController.js";
import isAdmin from "../middlewares/admin.js";
const user = express.Router();
// /api/v3/newuser
user.post("/newuser", NewUser);
// /api/v3/users/all
user.get("/all", isAdmin, getAllUers);
// /api/v3/user/:id
user.route("/:id").get(getUserId).delete(isAdmin, deleteUser);
export default user;

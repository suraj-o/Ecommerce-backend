import { User } from "../models/user.js";
import ErrorHandler from "../utils/Error.js";
import { TryCatch } from "./error.js";
const isAdmin = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return next(new ErrorHandler("login first", 401));
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("user not found", 404));
    if (user.role !== "admin")
        next(new ErrorHandler("only admin can use this route", 401));
    next();
});
export default isAdmin;

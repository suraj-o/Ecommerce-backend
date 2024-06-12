import mongoose from "mongoose";
import validator from "validator";
const schema = new mongoose.Schema({
    _id: {
        type: String,
        require: [true, "Please Enter ID"]
    },
    name: {
        type: String,
        require: [true, "Please enter name"],
    },
    email: {
        type: String,
        require: [true, "Please emter name"],
        unique: [true, "email already exists"],
        validate: validator.default.isEmail
    },
    photo: {
        type: String,
        require: [true, "Please add image"]
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    gender: {
        type: String,
        require: [true, "Please add gender"],
        enum: ["male", "female", "custom"]
    },
    dob: {
        type: Date,
        require: [true, "Please enter age"]
    },
}, {
    timestamps: true
});
schema.virtual("age").get(function () {
    const today = new Date(Date.now());
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if ((today.getMonth() < dob.getMonth() || today.getMonth() == dob.getMonth())
        && today.getDate() < dob.getDate()) {
        age--;
    }
    return age;
});
export const User = mongoose.model("User", schema);

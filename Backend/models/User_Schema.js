const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
        maxlength: [30, "Name cannot be longer than 30 characters"],
        minlength: [2, "Name cannot be shorter than 2 characters"],
        match: [/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: [30, "Email is maximum 30 characters"],
        match: [/\S+@\S+\.\S+/, "Please provide a valid email address"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        minlength: [10, "Phone number must be at least 10 digits"],
        maxlength: [10, "Phone number is maximum 10 digits"],
        match: [/^\d+$/, "Phone can only contain numbers"]

    },
    password: {
        type: String,
        // required:true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    isSuperAdmin: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Deleted"],
        default: "Active"
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },
    isCompanyOwner: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
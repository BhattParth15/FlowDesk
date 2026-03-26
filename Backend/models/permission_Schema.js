const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [20, "Permission cannot be longer than 20 characters"],
        minlength: [2, "Permission cannot be shorter than 2 characters"],
        match: [/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"],
        required: [true, "Permission Name is required"],
    },
    value: String,
    status: {
        type: String,
        enum: ["Active", "Inactive", "Deleted"],
        required: [true, "Permission Status is required"],
        default: "Active"
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Permission", permissionSchema);
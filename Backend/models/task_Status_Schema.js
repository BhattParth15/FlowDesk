const mongoose = require("mongoose");

const taskStatusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Deleted"],
        default: "Active"
    }
}, { timestamps: true });

module.exports = mongoose.model("TaskStatus", taskStatusSchema);

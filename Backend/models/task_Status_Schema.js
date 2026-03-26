const mongoose = require("mongoose");

const taskStatusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Task Status Name is required"],
        trim: true,
        maxlength: [20, "Task Status cannot be longer than 20 characters"],
        minlength: [2, "Task Status cannot be shorter than 2 characters"],
        match: [/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"]
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Deleted"],
        default: "Active"
    },
    // companyId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Company",
    //     required: true
    // },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
        // required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("TaskStatus", taskStatusSchema);

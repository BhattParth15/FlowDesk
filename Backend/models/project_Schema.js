const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [20, "Task cannot be longer than 20 characters"],
        minlength: [2, "cannot be shorter than 2 characters"],
        required: [true, "Project Name is required"],
    },
    description: {
        type: String,
        maxlength: [300, "Description cannot be longer than 300 characters"],
        required: [true, "Project Description is required"],
    },
    assignedUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Project Assignee is required"],
    }],
    status: {
        type: String,
        enum: ["Active", "Inactive", "Deleted"],
        default: "Active"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
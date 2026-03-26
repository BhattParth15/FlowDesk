const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Task Name is required"],
        maxlength: [30, "Task cannot be longer than 30 characters"],
        minlength: [2, "Name cannot be shorter than 2 characters"],
        match: [/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"]
    },
    description: {
        type: String,
        minlength: [2, "Deacription cannot be shorter than 2 characters"],
        maxlength: [300, "Description cannot be longer than 300 characters"],
        required: [true, "Description is required"],

    },
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    image: {
        type: [String],
        default: [],
    },
    video: {
        type: String,
        default: "video.png"
    },
    taskStatus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskStatus",
        required: [true, "Task Status is required"],
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Assignee is required"],
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Deleted"],
        default: "Active"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    type: {
        type: String,
        enum: ["task", "issue"],
        default: "task"
    },
    priority: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "Low"
    },
    // companyId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Company",
    //     required: true
    // },

}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
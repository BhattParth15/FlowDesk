const Task = require("../models/Task_Schema.js");
const sendEmail = require("../utils/send_Email.js");
const User = require("../models/User_Schema.js");
const TaskStatus = require("../models/task_Status_Schema.js");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const mongoose=require("mongoose");

const getTasks = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";
        const statusId = req.query.status || "";
        const skip = (page - 1) * limit;

        let filter = { status: { $ne: "Deleted" } };

        //Convert to ObjectId
        if (statusId && mongoose.Types.ObjectId.isValid(statusId)) {
            filter.taskStatus = statusId;
        }
        
        if (search.trim() !== "") {
            filter.name = { $regex: search.trim(), $options: "i" };
        }

        const totalTasks = await Task.countDocuments(filter);

        const tasks = await Task.find(filter)
            .skip(skip)
            .limit(limit)
            .populate("assignedTo", "name email")
            .populate("taskStatus", "name status");

        
        res.json({
            totalTasks,
            tasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page
        });


    } catch (error) {
        res.status(500).json({ message: "Get Tasks Error", error: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        let { name, description, taskStatus, assignedTo } = req.body;

        const taskStatusId = taskStatus?._id || taskStatus || null;
        const assignedToId = assignedTo?._id || assignedTo || null;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        name = name.trim();

        const existing = await Task.findOne({ name });
        if (existing) {
            // If deleted → restore
            if (existing.status === "Deleted") {
                existing.status = "Active";
                await existing.save();
                return res.json({ message: "Task restored successfully" });
            }
            // If already active → error
            return res.status(400).json({
                message: "Task already exists"
            });
        }

        // Image And Video Part
        let imageUrls = [];
        let videoUrl = "";

        // IDEA 3: Upload Multiple Images
        if (req.files?.image) {
            for (const file of req.files.image) {
                const result = await cloudinary.uploader.upload(file.path, { 
                    folder: "tasks/images" 
                });
                const fileNameOnly = result.secure_url.split('/').pop();
                imageUrls.push(fileNameOnly);
                
                // Cleanup: Delete local file after Cloudinary upload
                //if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            }
        }

        // Upload Video
        if (req.files?.video) {
            const result = await cloudinary.uploader.upload(req.files.video[0].path, {
                folder: "tasks/videos",
                resource_type: "video"
            });
            const VideoNameOnly = result.secure_url.split('/').pop();
            videoUrl = VideoNameOnly;
            
            // Cleanup: Delete local file
            //if (fs.existsSync(req.files.video[0].path)) fs.unlinkSync(req.files.video[0].path);
        }


        const newTask = await Task.create({
            name,
            description,
            taskStatus: taskStatusId,
            assignedTo: assignedToId,
            image: imageUrls,
            video: videoUrl,
            createdBy: req.user.id
        });

        const populatedTask = await Task.findById(newTask._id)
            .populate("assignedTo", "name email")
            .populate("taskStatus", "name status");

        // 🔔 Send Email if assigned
        if (assignedTo) {
            const user = await User.findById(assignedTo);

            if (user) {
                sendEmail(
                    user.email,
                    "New Task Assigned",
                    `Hello ${user.name},

A new task has been assigned to you.

Task Name: ${name}
Description: ${description}

Please login to Task Manager App to view details.

Regards,
Task Manager Team`
                );
            }
        }

        req.io.emit("taskCreated", populatedTask);

        res.status(201).json(newTask);

    } catch (error) {
        console.log("Request body:", req.body);
        console.log("req.user:", req.user);
        res.status(500).json({ message: "Create Task Error", error });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;

        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        let imageUrls = existingTask.image || [];
        let videoUrl = existingTask.video || "";

        // 🔴 REMOVE SELECTED OLD IMAGES
        if (req.body.removeImages) {
            const removeImages = Array.isArray(req.body.removeImages)
                ? req.body.removeImages
                : [req.body.removeImages];

            imageUrls = imageUrls.filter(img => !removeImages.includes(img));
        }

        // 🔴 REMOVE OLD VIDEO
        if (req.body.removeVideo === "true") {
            videoUrl = "";
        }

        // ADD NEW IMAGES
        if (req.files?.image) {
            for (const file of req.files.image) {
                const result = await cloudinary.uploader.upload(
                    file.path,
                    { folder: "tasks/images" }
                );
                const fileNameOnly = result.secure_url.split('/').pop();
                imageUrls.push(fileNameOnly);
            }
        }

        // ADD / REPLACE VIDEO
        if (req.files?.video) {
            const result = await cloudinary.uploader.upload(
                req.files.video[0].path,
                {
                    folder: "tasks/videos",
                    resource_type: "video"
                }
            );
            const VideoNameOnly = result.secure_url.split('/').pop();
            videoUrl = VideoNameOnly;
        }

        const updateData = {
            ...req.body,
            image: imageUrls,
            video: videoUrl
        };

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
            .populate("assignedTo", "name email")
            .populate("taskStatus", "status");

        req.io.emit("taskUpdated", updatedTask);
        res.json(updatedTask);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Update Task Error", error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        // Soft delete Task
        await Task.findByIdAndUpdate(taskId, {
            status: "Deleted"
        });

        // Soft delete related TaskStatus
        await TaskStatus.findOneAndUpdate(
            { task: taskId },
            { status: "deleted" }
        );

        req.io.emit("taskDeleted", taskId);

        res.json({ message: "Task and related TaskStatus deleted" });

    } catch (error) {
        console.log("DELETE TASK ERROR:", error); 
        res.status(500).json({ message: "Delete Task Error", error });
    }
};

const completeTask = async (req, res) => {
    try {
        const { taskId, statusId } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ msg: "Task not found" });
        }

        // Only SuperAdmin or assigned user can update
        if (
            !req.user.isSuperAdmin &&
            task.assignedTo.toString() !== req.user.id
        ) {
            return res.status(403).json({ msg: "Not allowed" });
        }

        // Update taskStatus reference
        task.taskStatus = statusId;
        await task.save();

        req.io.emit("taskCompleted", task._id);
        res.json({ msg: "Task Status Updated Successfully" });

    } catch (error) {
        res.status(500).json({ message: "Complete Task Error", error });
    }
};


module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask
};

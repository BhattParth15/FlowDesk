const Task = require("../models/Task_Schema.js");
const sendEmail = require("../utils/send_Email.js");
const User = require("../models/User_Schema.js");
const TaskStatus = require("../models/task_Status_Schema.js");
const cloudinary = require("../config/cloudinary");
const Email_Template = require("../utils/Email_Template.js");
const Project = require("../models/project_Schema.js");
const FRONTEND_URL = process.env.FRONTEND_URL;

const fs = require("fs");

const mongoose = require("mongoose");
const { log } = require("console");

const getTasks = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";
        const statusId = req.query.status || "";
        const assigneeId = req.query.assignedTo || "";
        const skip = (page - 1) * limit;

        let filter = { status: { $ne: "Deleted" } };

        // if (req.query.dataType === "issue") {
        //     filter.type = "issue";
        // }
        // if (req.query.dataType === "task") {
        //     filter.type = { $ne: "issue" };
        // }
        if (req.query.type) {
            filter.type = req.query.type;
        }
        if (req.query.projectId) {
            filter.projectId = req.query.projectId;
        }
        if (req.query.projectIds) {
            const ids = req.query.projectIds.split(","); // array of IDs
            filter.projectId = { $in: ids };
        }
        //Convert to ObjectId
        if (statusId && mongoose.Types.ObjectId.isValid(statusId)) {
            filter.taskStatus = statusId;
        }
        if (assigneeId && mongoose.Types.ObjectId.isValid(assigneeId)) {
            filter.assignedTo = assigneeId;
        }
        if (search.trim() !== "") {
            filter.name = { $regex: search.trim(), $options: "i" };
        }

        const totalTasks = await Task.countDocuments(filter);

        const tasks = await Task.find(filter)
            .skip(skip)
            .limit(limit)
            .populate("assignedTo", "name email")
            .populate("taskStatus", "name status")
            .populate("projectId", "name")

        res.json({
            totalTasks,
            tasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json({ message: "Get Tasks Error", error: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        let { name, description, taskStatus, projectId, assignedTo, priority } = req.body;

        const taskStatusId = taskStatus?._id || taskStatus || null;
        const assignedToId = assignedTo?._id || assignedTo || null;
        const type = priority ? "issue" : "task";

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!description) {
            return res.status(400).json({ message: "Description is required" });
        }

        name = name.trim();

        const existing = await Task.findOne({ name });
        if (existing) {
            // If deleted → restore
            if (existing.status === "Deleted") {
                existing.status = "Active";
                existing.name = name;
                existing.description = description;
                existing.taskStatus = taskStatus;
                existing.projectId = projectId;
                existing.assignedTo = assignedTo;
                existing.priority = priority;
                await existing.save();
                req.io.emit("taskCreated", existing);
                if (type === "task") {
                    return res.json({ type: "success", message: "Task created successfully" });
                } else {
                    return res.json({ type: "success", message: "Issue created successfully" });
                }
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

        const users = await User.find();

        const mentionIds = users
            .filter(s => description.includes(`@${s.name}`))
            .map(s => s._id);

        const newTask = await Task.create({
            name,
            description,
            mentions: mentionIds,
            taskStatus: taskStatusId,
            assignedTo: assignedToId,
            image: imageUrls,
            video: videoUrl,
            projectId,
            createdBy: req.user.id,
            type,
            priority: priority || null
        });
        const populatedTask = await Task.findById(newTask._id)
            .populate("assignedTo", "name email")
            .populate("taskStatus", "name status");

        if (type === "task") {
            const Path = `/?redirect=/task/${populatedTask._id}`;
            // Send email if task assigned
            if (assignedTo) {
                const user = await User.findById(assignedTo);
                if (user) {
                    const project = await Project.findById(projectId);
                    const emailBody = `
                    You have been assigned a new task in the project <b>${project?.name}</b>.
                    <br><br>
                    <b>Task Name:</b> ${name} <br>
                    <b>Description:</b> ${description || "No description"} <br><br>

                    Please review the task and update the progress accordingly.
                `;
                    const html = Email_Template(
                        user.name,
                        emailBody,
                        {
                            type: "Task Assigned",
                            label: "View Task",
                            link: Path
                        },
                        project?.name || "Task Manager"
                    );
                    sendEmail({
                        to: user.email,
                        subject: "Action Required: New Task Assigned",
                        html
                    });
                }
            }
        } else {
            const Path = `/?redirect=/issue/${populatedTask._id}`;
            // Send email if task assigned
            if (assignedTo) {
                const user = await User.findById(assignedTo);
                if (user) {
                    const project = await Project.findById(projectId);
                    const emailBody = `
                    You have been assigned a new issue in the project <b>${project?.name}</b>.
                    <br><br>
                    <b>Issue Name:</b> ${name} <br>
                    <b>Description:</b> ${description || "No description"} <br>
                    <b>Priority:</b> ${priority || "Low"} <br><br>

                    Please review the issue and update the progress accordingly.
                `;
                    const html = Email_Template(
                        user.name,
                        emailBody,
                        {
                            type: "Issue Assigned",
                            label: "View Issue",
                            link: Path
                        },
                        project?.name || "Task Manager"
                    );
                    sendEmail({
                        to: user.email,
                        subject: "Action Required: New Issue Assigned",
                        html
                    });
                }
            }
        }
        req.io.emit("taskCreated", populatedTask);
        if (type === "task") {
            res.status(201).json({ type: "success", message: "Task Created Successfully and Email Send To Assignee", newTask });
        } else {
            res.status(201).json({ type: "success", message: "Issue Created Successfully and Email Send To Assignee", newTask });
        }

    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json({ message: "Create Data Error", error });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        let { name, description, taskStatus, projectId, assignedTo, priority } = req.body;

        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({ message: "Data not found" });
        }
        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!description || description.trim() === "") {
            return res.status(400).json({ message: "Description is required" });
        }

        if (!assignedTo) {
            return res.status(400).json({ message: "Assignee is required" });
        }

        if (!taskStatus) {
            return res.status(400).json({ message: "Task status is required" });
        }
        const type = existingTask.type;
        if (type === "issue" && (!priority || priority.trim() === "")) {
            return res.status(400).json({ message: "Priority is required" });
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
            const newImages = req.files.image.length;
            if (imageUrls.length + newImages > 5) {
                return res.status(400).json({
                    message: "Maximum 5 images allowed"
                });
            }
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
            video: videoUrl,
            type: req.body.priority ? "issue" : existingTask.type,
            priority: req.body.priority || existingTask.priority
        };
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate("assignedTo", "name email")
            .populate("taskStatus", "status");

        const oldAssignee = existingTask.assignedTo?.toString();
        const newAssignee = assignedTo?.toString();

        const isNameChanged = name && name !== existingTask.name;
        const isDescriptionChanged = description && description !== existingTask.description;
        const isAssigneeChanged = newAssignee && oldAssignee !== newAssignee;

        if (type === "task") {
            const Path = `/?redirect=/task/${updatedTask._id}`;
            // Send email if task assigned
            if (isAssigneeChanged || isNameChanged || isDescriptionChanged) {
                const user = await User.findById(newAssignee || oldAssignee);
                const project = await Project.findById(projectId);

                if (user) {
                    let changes = [];
                    if (isNameChanged) {
                        changes.push(`Task name updated to <b>${name}</b>`);
                    }
                    if (isDescriptionChanged) {
                        changes.push(`Description updated`);
                    }
                    if (isAssigneeChanged) {
                        changes.push(`You have been assigned to this task`);
                    }
                    const emailBody = `
                You have been assigned to a task in project <b>${project?.name}</b>.
                <br><br>
                ${changes.join("<br>")}
                <br><br>
                <b>Task:</b> ${updatedTask.name} <br>
                <b>Description:</b> ${updatedTask.description || "No description"}<br>
                Please review the task and update the progress accordingly.
                `;
                    const html = Email_Template(
                        user.name,
                        emailBody,
                        {
                            type: "Task Assigned",
                            label: "View Task",
                            link: Path
                        },
                        project?.name || "Task Manager"
                    );
                    sendEmail({
                        to: user.email,
                        subject: "Action Required: New Task Assigned",
                        html
                    });
                }
            }
        } else {
            const Path = `/?redirect=/issue/${updatedTask._id}`;
            // Send email if task assigned
            if (isAssigneeChanged || isNameChanged || isDescriptionChanged) {
                const user = await User.findById(newAssignee || oldAssignee);
                const project = await Project.findById(projectId);

                if (user) {
                    let changes = [];
                    if (isNameChanged) {
                        changes.push(`Issue name updated to <b>${name}</b>`);
                    }
                    if (isDescriptionChanged) {
                        changes.push(`Description updated`);
                    }
                    if (isAssigneeChanged) {
                        changes.push(`You have been assigned to this issue`);
                    }
                    const emailBody = `
                You have been assigned to a issue in project <b>${project?.name}</b>.
                <br><br>
                ${changes.join("<br>")}
                <br><br>
                <b>Issue:</b> ${updatedTask.name} <br>
                <b>Description:</b> ${updatedTask.description || "No description"}<br>
                Please review the issue and update the progress accordingly.
                `;
                    const html = Email_Template(
                        user.name,
                        emailBody,
                        {
                            type: "Issue Assigned",
                            label: "View Issue",
                            link: Path
                        },
                        project?.name || "Task Manager"
                    );
                    sendEmail({
                        to: user.email,
                        subject: "Action Required: New Issue Assigned",
                        html
                    });
                }
            }
        }

        req.io.emit("taskUpdated", updatedTask);
        if (type === "task") {
            res.json({ type: "success", message: "Task Updated Successfully.", updatedTask });
        } else {
            res.json({ type: "success", message: "Issue Updated Successfully.", updatedTask });
        }

    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
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

        res.json({ type: "success", message: "Data and related TaskStatus deleted Successfully" });

    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json({ message: "Delete Error", error });
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

const getTasksByProject = async (req, res) => {
    try {

        const projectId = req.params.projectId;

        const tasks = await Task.find({ projectId })
            .populate("projectId", "name")
            .populate("assignedUser", "name email");

        res.json(tasks);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    getTasksByProject
};

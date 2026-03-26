const TaskStatus = require("../models/task_Status_Schema.js");
const mongoose = require("mongoose");

// Create Label
const createTaskStatus = async (req, res) => {
    try {
        let { name, status, projectId } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        name = name.trim();
        const existing = await TaskStatus.findOne({ name });
        if (existing) {
            // If deleted → restore
            if (existing.status === "deleted") {
                existing.status = status || "Active";
                existing.name = name;
                existing.projectId = projectId;
                await existing.save();
                req.io.emit("taskStatusCreated", existing);
                return res.json({ type: "success", message: "Task Status Created successfully" });
            }

            // If already active → error
            return res.status(400).json({
                message: "Task Status already exists"
            });
        }
        const newLabel = await TaskStatus.create({
            name,
            status,
            projectId
        });

        req.io.emit("taskStatusCreated", newLabel);
        res.status(201).json({ type: "success", message: "Task Status Created Successfully.", newLabel });

    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json({ message: "Task Status Creation Error", error });
    }
};

// Get All Labels (Exclude Deleted)
const getTaskStatus = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";
        const status = req.query.status || "";
        const skip = (page - 1) * limit;

        const defaultStatuses = ["Pending", "Completed", "Inprogress"];
        const existingDefaults = await TaskStatus.find({ projectId: null });
        const existingNames = existingDefaults.map(s => s.name);

        const statusesToInsert = defaultStatuses
            .filter(name => !existingNames.includes(name))
            .map(name => ({ name, projectId: null }));

        if (statusesToInsert.length > 0) {
            await TaskStatus.insertMany(statusesToInsert);
        }

        const filter = { status: { $ne: "deleted" } };

        // if (req.query.projectId) {
        //     filter.projectId = req.query.projectId;
        // }
        if (req.query.projectId) {
            // Single project → include default also
            filter.$or = [
                { projectId: req.query.projectId },
                { projectId: null }
            ];
        }
        else if (req.query.projectIds) {
            // Multiple projects (ALL dropdown)
            const ids = req.query.projectIds.split(",");
            filter.$or = [
                { projectId: { $in: ids } },
                { projectId: null }   // (default statuses)
            ];
        }
        else {
            // No project → only default
            filter.projectId = null;
        }

        if (status && status !== "") {
            filter.status = status;
        } else {
            filter.status = { $ne: "deleted" };
        }

        if (search.trim() !== "") {
            filter.name = { $regex: search.trim(), $options: "i" };
        }

        const total = await TaskStatus.countDocuments(filter);

        let labels = await TaskStatus.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        res.json({
            totalTaskStatus: total,
            currentPage: page,
            totalPage: Math.ceil(total / limit),
            taskStatus: labels
        });

    } catch (error) {
        res.status(500).json({ message: "Get All Task Status Error", error });
    }
};

// Get By ID
const getTaskStatusByID = async (req, res) => {
    try {
        const label = await TaskStatus.findById(req.params.id);

        if (!label || label.status === "Deleted") {
            return res.status(404).json({ message: "Label Not Found" });
        }
        res.json(label);

    } catch (error) {
        res.status(500).json({ message: "TaskStatus Get Error", error });
    }
};

// Update Label (name or status)
const updateTaskStatus = async (req, res) => {
    try {
        const { name, status } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        const updated = await TaskStatus.findByIdAndUpdate(
            req.params.id,
            { name, status },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Label Not Found" });
        }
        req.io.emit("taskStatusUpdated", updated);
        res.json({ type: "success", message: "Task Status Updated Successfully.", updated });

    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json({ message: "TaskStatus Update Error", error });
    }
};

// Soft Delete
const deleteTaskStatus = async (req, res) => {
    try {
        const defaultStatusId = "000000000000000000000000";
        if (req.params.id === defaultStatusId) {
            return res.status(400).json({
                type: "error",
                message: "This is the default status and cannot be deleted"
            });
        }
        const deleted = await TaskStatus.findByIdAndUpdate(
            req.params.id,
            { status: "deleted" },
            { new: true }
        );

        if (!deleted) {
            return res.status(404).json({ message: "Label Not Found" });
        }
        req.io.emit("taskStatusDeleted", deleted._id);
        res.json({ type: "success", message: "Task Status Deleted Successfully" });

    } catch (error) {
        res.status(500).json({ message: "TaskStatus Deletion Error", error });
    }
};


module.exports = { createTaskStatus, getTaskStatus, getTaskStatusByID, updateTaskStatus, deleteTaskStatus };

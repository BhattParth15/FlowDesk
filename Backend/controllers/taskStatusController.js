const TaskStatus = require("../models/task_Status_Schema.js");

// Create Label
const createTaskStatus = async (req, res) => {
    try {
        let { name, status } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        name = name.trim();
        const existing = await TaskStatus.findOne({ name });
        if (existing) {
            // If deleted → restore
            if (existing.status === "deleted") {
                existing.status = "Active";
                await existing.save();
                req.io.emit("taskStatusCreated", existing);
                return res.json({ message: "Permission restored successfully" });
            }
            
            // If already active → error
            return res.status(400).json({
                message: "Permission already exists"
            });
        }
        const newLabel = await TaskStatus.create({
            name,
            status
        });

        req.io.emit("taskStatusCreated", newLabel);
        res.status(201).json(newLabel);

    } catch (error) {
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

        const filter = { status: { $ne: "deleted" } };

        if (status && status !== "") {
            filter.status = status;
        } else {
            filter.status = { $ne: "deleted" };
        }
        
        if (search.trim() !== "") {
            filter.name = { $regex: search.trim(), $options: "i" };
        }
        const total = await TaskStatus.countDocuments(filter);

        const labels = await TaskStatus.find(filter)
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

        const updated = await TaskStatus.findByIdAndUpdate(
            req.params.id,
            { name, status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Label Not Found" });
        }
        req.io.emit("taskStatusUpdated", updated);
        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: "TaskStatus Update Error", error });
    }
};

// Soft Delete
const deleteTaskStatus = async (req, res) => {
    try {
        const deleted = await TaskStatus.findByIdAndUpdate(
            req.params.id,
            { status: "deleted" },
            { new: true }
        );

        if (!deleted) {
            return res.status(404).json({ message: "Label Not Found" });
        }
        req.io.emit("taskStatusDeleted", deleted._id);
        res.json({ message: "Label Deleted Successfully" });

    } catch (error) {
        res.status(500).json({ message: "TaskStatus Deletion Error", error });
    }
};


module.exports = { createTaskStatus, getTaskStatus, getTaskStatusByID, updateTaskStatus, deleteTaskStatus };

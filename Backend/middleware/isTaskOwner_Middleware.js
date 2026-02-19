
const Task = require("../models/Task_Schema.js");

const isTaskOwner = async (req, res, next) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    if (!req.user.isSuperAdmin && task.assignedTo.toString() !== req.user.id)
        {
        return res.status(403).json({
            message: "You can modify only your own task"
        });
    }

    next();
};

module.exports = isTaskOwner;

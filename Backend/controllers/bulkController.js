
const XLSX = require("xlsx");
const Task = require("../models/Task_Schema.js");
const Issue = require("../models/Task_Schema.js");
const User = require("../models/User_Schema.js");
const TaskStatus = require("../models/task_Status_Schema.js");
const Company = require("../models/company_Schema.js");
const Project = require("../models/project_Schema.js");
const mongoose = require("mongoose");
const checkPlanLimit = require("../middleware/checkPlanLimit_Middleware.js");

const getRemainingCount = async (companyId, type, projectId, bulkCount) => {
    const company = await Company.findById(companyId);
    if (!company?.subscription) return 0;

    const module = company.subscription.modules.find(
        m => m.name.toLowerCase() === type.toLowerCase()
    );
    if (!module) return 0;

    const moduleLimit = Number(module.limit); //  numeric updated limit

    // Use projectId if provided, otherwise all company projects
    let projectIds = [];
    if (projectId) {
        projectIds = [projectId];
    } else {
        const projects = await Project.find({ companyId }).select("_id");
        projectIds = projects.map(p => p._id);
    }

    let currentCount = 0;
    if (type.toLowerCase() === "task") {
        currentCount = await Task.countDocuments({
            projectId: { $in: projectIds },
            type: "task",
            status: { $ne: "Deleted" }
        });
    } else if (type.toLowerCase() === "issue") {
        currentCount = await Issue.countDocuments({
            projectId: { $in: projectIds },
            type: "issue",
            status: { $ne: "Deleted" }
        });
    }

    const remaining = moduleLimit - currentCount;
    return remaining > 0 ? Math.min(bulkCount, remaining) : 0;
};

const bulkUpload = async (req, res) => {
    try {
        const { type, projectId } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "File required" });
        }
        if (!type || !["task", "issue"].includes(type)) {
            return res.status(400).json({ message: "Invalid type" });
        }
        const companyId = req.user.companyId;

        //PLAN FETCH
        const company = await Company.findById(companyId);

        if (!company?.subscription) {
            return res.status(403).json({ message: "No active plan" });
        }

        // CHECK EXPIRY
        if (new Date() > new Date(company.subscription.endDate)) {
            return res.status(403).json({ message: "Subscription expired" });
        }

        // Read Excel
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        let data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!data.length) {
            return res.status(400).json({ message: "Excel file empty" });
        }
        const bulkModule = company.subscription.modules.find(
            m => m.name.toLowerCase() === "bulkupload"
        );

        if (bulkModule) {
            const bulkLimit = Number(bulkModule.limit);
            //  count already used bulk uploads (per type)
            const projects = await Project.find({ companyId }).select("_id");
            const projectIds = projects.map(p => p._id);
            const bulkUsed = await Task.countDocuments({
                projectId: { $in: projectIds },
                type: type,
                isBulk: true,
                status: { $ne: "Deleted" }
            });
            const remainingBulk = bulkLimit - bulkUsed;
            // no space left
            if (remainingBulk <= 0) {
                return res.status(403).json({
                    message: `Bulk upload limit reached for ${type} (${bulkLimit})`
                });
            }
            //  file exceeds remaining limit → reject (NO slicing)
            if (data.length > remainingBulk) {
                return res.status(403).json({
                    message: `File contains ${data.length} ${type}, but only ${remainingBulk} allowed by bulk limit`
                });
            }
        }
        const allowedCount = await getRemainingCount(companyId, type, projectId, data.length);
        if (allowedCount === 0) {
            return res.status(403).json({
                message: `${type} limit exceeded`
            });
        }
        if (data.length > allowedCount) {
            return res.status(403).json({
                message: `File contains ${data.length} ${type}, but only ${allowedCount} allowed by plan`
            });
        }
        const staffNames = [
            ...new Set(data.map(row => row.assignedTo).filter(Boolean))
        ];
        const users = await User.find(
            { name: { $in: staffNames } },
            { _id: 1, name: 1 }
        );
        const userMap = {};
        users.forEach(user => {
            userMap[user.name.toLowerCase()] = user._id;
        });

        const statuses = await TaskStatus.find({}, { _id: 1, name: 1 });
        const statusMap = {};
        statuses.forEach(status => {
            statusMap[status.name.toLowerCase()] = status._id;
        });

        const records = data.map(row => {
            const assigneeName = row.assignedTo?.toLowerCase();
            const statusName = row.taskStatus?.toLowerCase();
            return {
                name: row.name,
                description: row.description,
                taskStatus: statusMap[statusName] || null,
                assignedTo: userMap[assigneeName] || null,
                status: row.status || "Active",
                priority: row.priority || "Low",
                projectId: new mongoose.Types.ObjectId(projectId),
                type: type,
                isBulk: true,
                createdBy: new mongoose.Types.ObjectId(req.user.id)
            };
        });
        //console.log("First record:", records[0]);
        const result = await Task.insertMany(records);
        //console.log("Result:",result)
        res.json({
            message: `${type} bulk upload successful`,
            totalInserted: result.length
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Upload failed" });
    }
};
module.exports = { bulkUpload };
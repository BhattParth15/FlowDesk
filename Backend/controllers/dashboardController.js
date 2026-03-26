const User = require("../models/User_Schema.js");
const Role = require("../models/role_Schema.js");
const Project = require("../models/project_Schema.js");
const Task = require("../models/Task_Schema.js");
const Document = require("../models/document_Schema.js");
const TaskStatus = require("../models/task_Status_Schema.js"); // ✅ ADD THIS

const getDashboard = async (req, res) => {
    try {
        const isSuperAdmin = req.user.isSuperAdmin;
        const queryCompanyId = req.query.companyId;

        let companyFilter = {};

        // ✅ COMPANY FILTER
        if (isSuperAdmin) {
            if (queryCompanyId && queryCompanyId !== "all") {
                companyFilter.companyId = queryCompanyId;
            }
        } else {
            companyFilter.companyId = req.user.companyId;
        }

        // ✅ PROJECTS
        const projects = await Project.find(companyFilter).select("_id name");
        const projectIds = projects.map(p => p._id);

        // ✅ COUNTS
        const staff = await User.countDocuments({
            ...companyFilter,
            status: { $ne: "deleted" },
            isSuperAdmin: false
        });

        const roles = await Role.countDocuments({
            ...companyFilter,
            status: { $ne: "deleted" }
        });

        const projectCount = projects.length;

        const tasks = await Task.countDocuments({
            projectId: { $in: projectIds },
            type: "task",
            status: { $ne: "Deleted" }
        });

        const issues = await Task.countDocuments({
            projectId: { $in: projectIds },
            type: "issue",
            status: { $ne: "Deleted" }
        });

        const documents = await Document.countDocuments({
            projectId: { $in: projectIds },
            status: { $ne: "deleted" }
        });

        // =========================================
        // ✅ FIXED ISSUE STATUS (IMPORTANT PART)
        // =========================================

        const statuses = await TaskStatus.find(); // get all statuses

        const openStatusIds = statuses
            .filter(s => s.name.toLowerCase() === "open")
            .map(s => s._id);

        const progressStatusIds = statuses
            .filter(s => s.name.toLowerCase().includes("progress"))
            .map(s => s._id);

        const closedStatusIds = statuses
            .filter(s => s.name.toLowerCase() === "closed")
            .map(s => s._id);

        const lowIssues = await Task.countDocuments({
            projectId: { $in: projectIds },
            type: "issue",
            priority: "Low",
            status: { $ne: "Deleted" }
        });

        const midIssues = await Task.countDocuments({
            projectId: { $in: projectIds },
            type: "issue",
            priority: "Medium",
            status: { $ne: "Deleted" }
        });

        const highIssues = await Task.countDocuments({
            projectId: { $in: projectIds },
            type: "issue",
            priority: "High",
            status: { $ne: "Deleted" }
        });


        // =========================================
        // ✅ PROJECT WISE TASKS
        // =========================================
        const projectStats = await Promise.all(
            projects.map(async (p) => {
                const count = await Task.countDocuments({
                    projectId: p._id,
                    type: "task",
                    status: { $ne: "Deleted" }
                });
                const issueCount = await Task.countDocuments({
                    projectId: p._id,
                    type: "issue",
                    status: { $ne: "Deleted" }
                });

                return {
                    name: p.name,
                    tasks: count,
                    issues: issueCount
                };
            })
        );

        // =========================================
        // ✅ RECENT DOCUMENTS
        // =========================================
        const recentDocuments = await Document.find({
            projectId: { $in: projectIds }
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: 'ownerId',
                select: 'name'  // only get owner name
            })
            .select('name createdAt updatedAt ownerId');

        // =========================================
        // ✅ FINAL RESPONSE
        // =========================================
        res.json({
            staff,
            roles,
            projects: projectCount,
            tasks,
            issues,
            documents,
            lowIssues,
            midIssues,
            highIssues,
            projectStats,
            recentDocuments
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getDashboard };
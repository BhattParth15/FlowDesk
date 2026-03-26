const SubscriptionPlan = require("../models/subscription_Schema.js");
const Company = require("../models/company_Schema.js");
const Role = require("../models/role_Schema.js");
const Staff = require("../models/User_Schema.js");
const Project = require("../models/project_Schema.js");
const Task = require("../models/Task_Schema.js");
const Issue = require("../models/Task_Schema.js");
const TaskStatus = require("../models/task_Status_Schema.js");
const Document = require("../models/document_Schema.js");
const Permission = require("../models/permission_Schema.js");

// Helper Validation
const validatePlan = ({ planName, billingCycle, price, modules }) => {
    if (!planName) return "Plan name is required";

    const validCycles = ["Monthly", "Quarterly", "Half-Yearly", "Yearly"];
    if (!billingCycle || !validCycles.includes(billingCycle)) {
        return "Invalid billing cycle";
    }

    if (price < 0) return "Price cannot be negative";

    if (modules && !Array.isArray(modules)) {
        return "Modules must be an array";
    }

    if (modules) {
        for (let mod of modules) {
            if (!mod.moduleName) return "Module name is required";
            if (mod.limit < 0) return "Module limit cannot be negative";
        }
    }

    return null;
};

const createPlan = async (req, res) => {
    try {
        let { planName, billingCycle, price, modules } = req.body;

        const error = validatePlan(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }

        //Check duplicate
        const existing = await SubscriptionPlan.findOne({ planName });
        if (existing) {
            if (existing.isActive === false) {
                existing.isActive = true;
                existing.billingCycle = billingCycle;
                existing.price = price;
                existing.modules = modules;
                await existing.save();
                //req.io.emit("PlanCreated", existing);
                return res.json({ type: "success", message: "Plan Created successfully." });
            }
            return res.status(400).json({ message: "Plan already exists" });
        }
        const plan = await SubscriptionPlan.create({
            planName,
            billingCycle,
            price,
            modules
        });

        //req.io.emit("PlanCreated", plan);
        res.status(201).json({ type: "success", message: "Plan Created Successfully", plan });

    } catch (error) {
        res.status(500).json({ message: "Plan Create Error", error });
    }
};

const getPlans = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";
        const status = req.query.status || "";
        const billingCycle = req.query.billingCycle || "";
        const skip = (page - 1) * limit;

        const filter = { isActive: true };

        if (billingCycle && billingCycle !== "") {
            filter.billingCycle = billingCycle;
        }
        if (status === "active") {
            filter.isActive = true;
        } else if (status === "inactive") {
            filter.isActive = false;
        }

        if (search.trim() !== "") {
            filter.planName = { $regex: search.trim(), $options: "i" };
        }
        const total = await SubscriptionPlan.countDocuments(filter);
        const plans = await SubscriptionPlan.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({
            totalPlans: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            plans
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPlanById = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePlan = async (req, res) => {
    try {
        const { planName, billingCycle, price, modules, isActive } = req.body;

        const error = validatePlan(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }

        const updated = await SubscriptionPlan.findByIdAndUpdate(
            req.params.id,
            { planName, billingCycle, price, modules, isActive },
            { new: true, runValidators: true }
        );
        //req.io.emit("PlanUpdated", updated);
        res.json({ type: "success", message: "Plan Updated Successfully", updated });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findByIdAndUpdate(
            req.params.id,
            { isActive: false }
        );
        //req.io.emit("PlanDeleted", plan._id);
        res.status(200).json({ type: "success", message: "Plan Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getAllPlansForCompany = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find({ isActive: true })
            .select("planName billingCycle price modules");

        res.json(plans);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const applyPlan = async (req, res) => {
    try {
        const { companyId, planId } = req.body;
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) return res.status(404).json({ message: "Plan not found" });

        // duration
        let days = 30;
        if (plan.billingCycle === "Quarterly") days = 90;
        if (plan.billingCycle === "Half-Yearly") days = 180;
        if (plan.billingCycle === "Yearly") days = 365;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + days);

        // COPY MODULES (IMPORTANT)
        const modulesSnapshot = plan.modules.map(m => ({
            name: m.name || m.moduleName,
            limit: m.limit,
            bulkLimit: m.bulkLimit || 0
        }));

        const company = await Company.findByIdAndUpdate(
            companyId,
            {
                subscription: {
                    planId,
                    modules: modulesSnapshot,
                    startDate,
                    endDate,
                    status: "active"
                }
            },
            { new: true, runValidators: true }
        );

        res.json({ type: "success", message: "Plan Activated Successfully.", company });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const checkLimit = async (companyId, moduleName, bulkCount) => {
    const company = await Company.findById(companyId)
        .populate("subscription.planId");
    if (!company?.subscription?.planId) return true;

    const module = company.subscription.modules?.find(
        m => m.name.toLowerCase() === moduleName.toLowerCase()
    );
    if (!module) return true;
    if (new Date() > new Date(company.subscription.endDate)) {
        throw new Error("Subscription expired");
    }
    let count = 0;
    if (moduleName === "staff") {
        count = await Staff.countDocuments({ companyId, status: { $ne: "deleted" } });
    }
    if (moduleName === "project") {
        count = await Project.countDocuments({ companyId, status: { $ne: "deleted" } });
    }
    if (moduleName === "role") {
        count = await Role.countDocuments({ companyId, status: { $ne: "deleted" } });
    }
    const projects = await Project.find({ companyId }).select("_id");
    const projectIds = projects.map(p => p._id);
    if (moduleName === "task") {
        count = await Task.countDocuments({ projectId: { $in: projectIds }, type:"task", status: { $ne: "Deleted" } });
    }
    if (moduleName === "issue") {
        count = await Issue.countDocuments({ projectId: { $in: projectIds }, type:"issue", status: { $ne: "Deleted" } });
    }
    if (moduleName === "taskstatus") {
        count = await TaskStatus.countDocuments({ projectId: { $in: projectIds }, status: { $ne: "deleted" } });
    }
    if (moduleName === "document") {
        count = await Document.countDocuments({ projectId: { $in: projectIds }, status: { $ne: "deleted" } });
    }
    if (moduleName === "permission") {
        count = await Permission.countDocuments({ companyId, status: { $ne: "deleted" } });
    }

    const bulkModule = company.subscription.modules?.find(
        m => m.name.toLowerCase() === "bulkupload"
    );

    if (bulkCount > 1 && bulkModule?.limit) {
        if (bulkCount > bulkModule.limit) {
            throw new Error(`Bulk upload limit exceeded. Max ${bulkModule.limit} allowed at a time`);
        }
    }
    const remaining = module.limit - count;
    // if (remaining <= 0) {
    //     throw new Error(`${moduleName} limit exceeded (${count}/${module.limit})`);
    // }
    if (remaining < (bulkCount || 1)) {
    throw new Error(
        `${moduleName} limit exceeded. Remaining: ${remaining}, Trying to add: ${bulkCount || 1}`
    );
}
    return {allowed: true, remaining, count: Math.min(remaining, bulkCount || 1) };
};
const checkLimitAPI = async (req, res) => {
    try {
        const { companyId, moduleName } = req.query;

        const allowed = await checkLimit(companyId, moduleName);

        res.json({ allowed });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const expirePlans = async () => {
    await Company.updateMany(
        { "subscription.endDate": { $lt: new Date() } },
        { "subscription.status": "expired" }
    );
};

module.exports = { createPlan, getPlans, getPlanById, updatePlan, deletePlan, applyPlan, checkLimit, checkLimitAPI, getAllPlansForCompany };
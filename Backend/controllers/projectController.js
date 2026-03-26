const Project = require("../models/project_Schema.js");
const User = require("../models/User_Schema.js");

const createProject = async (req, res) => {
  try {
    let { name, description, assignedUser, createdBy, status } = req.body;

    const existing = await Project.findOne({ name });

    if (existing) {
      // If soft deleted → restore
      if (existing.status === "deleted") {
        existing.status = status || "Active";
        existing.name = name;
        existing.description = description;
        existing.assignedUser = assignedUser;
        existing.createdBy = createdBy;
        await existing.save();

        req.io.emit("ProjectCreated", existing);
        return res.json({ type: "success", message: "Project created successfully" });
      }

      return res.status(400).json({
        message: "Project already exists"
      });
    }

    const project = await Project.create({
      name,
      description,
      assignedUser,
      createdBy,
      status,
      companyId: req.user.companyId
    });

    req.io.emit("ProjectCreated", project);

    res.status(201).json({ type: "success", message: "Project created successfully", project });

  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: "Project Create Error", error });
  }
};

const getProjects = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const isSuperAdmin = req.user.isSuperAdmin;
    const queryCompanyId = req.query.companyId;

    const skip = (page - 1) * limit;

    const filter = {};

    //const user = await User.findById(req.user.id).populate("role");
    const user = req.user;

    // SuperAdmin → show all projects (optionally you can filter by company if query exists)
    if (!user.isSuperAdmin) {
      // CompanyOwner → show all projects in their company
      if (user.role.name === "CompanyOwner") {
        filter.companyId = user.companyId;
      } else {
        // Staff → only assigned projects in their company
        filter.companyId = user.companyId;
        filter.assignedUser = { $in: [user._id] };
      }
    }
    if (isSuperAdmin) {
      if (queryCompanyId && queryCompanyId !== "all") {
        filter.companyId = queryCompanyId;
      }
    } else {
      filter.companyId = req.user.companyId;
    }
    // Soft delete filter
    if (status && status !== "") {
      filter.status = status;
    } else {
      filter.status = { $ne: "deleted" };
    }

    // Search by name
    if (search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    const total = await Project.countDocuments(filter);

    const projects = await Project.find(filter)
      .populate("assignedUser", "name email phone role")
      .populate("createdBy", "roleName")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      totalProjects: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      projects
    });

  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: error.message });
  }
};


const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("assignedUser", "name email phone role")
      .populate("createdBy", "name");

    if (!project || project.status === "deleted") {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateProject = async (req, res) => {
  try {
    const { name, description, assignedUser, createdBy, status } = req.body;
    const projectId = req.params.id;
    if (!status) {
      return res.status(400).json({ message: "Please select Status" });
    }
    // Check project exists
    const existingProject = await Project.findById(projectId);
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Duplicate name check (only if changed)
    if (name !== existingProject.name) {
      const nameExists = await Project.findOne({ name });
      if (nameExists) {
        return res.status(400).json({
          message: "Project name already exists"
        });
      }
    }
    const updated = await Project.findByIdAndUpdate(
      projectId,
      { name, description, assignedUser, createdBy, status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    req.io.emit("ProjectUpdated", updated);

    res.json({ type: "success", message: "Project Updated Successfully.", updated });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: "deleted" }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    req.io.emit("ProjectDeleted", project._id);

    res.json({ type: "success", message: "Project deleted successfully" });

  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: error.message });
  }
};


const getProjectStaff = async (req, res) => {
  try {
    const projectId = req.params.id;

    // find project
    const project = await Project.findById(projectId)
      .populate("assignedUser", "name email role");

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json({
      staff: project.assignedUser
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message
    });
  }
};


module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectStaff };
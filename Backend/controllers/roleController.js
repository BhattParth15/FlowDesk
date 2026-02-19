const Role = require("../models/role_Schema.js");
const Permission = require("../models/permission_Schema.js");

// Helper function to extract only the 'true' permission IDs
const getPermissionStrings = async (PermissionModel, permissionsArray) => {
  if (!Array.isArray(permissionsArray)) return [];

  const result = [];
  for (const p of permissionsArray) {
    // Find the original permission document to get its 'value' (e.g., 'staff')
    const doc = await PermissionModel.findById(p.permissionId);
    if (doc && doc.value) {
      if (p.read) result.push(`${doc.value}.read`);
      if (p.create) result.push(`${doc.value}.create`);
      if (p.update) result.push(`${doc.value}.update`);
      if (p.delete) result.push(`${doc.value}.delete`);
    }
  }
  return result;
};

//CREATE ROLE

const createRole = async (req, res) => {
  try {
    let { name, permissions, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    name = name.trim();
    const existing = await Role.findOne({ name });
    if (existing) {
      // If deleted → restore
      if (existing.status === "deleted") {
        existing.status = "Active";
        await existing.save();
        req.io.emit("roleCreated", role);
        return res.json({ message: "Role restored successfully" });
      }
      // If already active → error
      return res.status(400).json({
        message: "Role already exists"
      });
    }

    // TRANSFORM: Convert complex objects into a flat array of IDs
    const processedPermissions = await getPermissionStrings(Permission, permissions);
    const role = await Role.create({
      name,
      permissions: processedPermissions,
      status
    });

    req.io.emit("roleCreated", role);

    res.status(201).json(role);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET ALL ROLES (Pagination)
const getRoles = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const skip = (page - 1) * limit;

    const filter = { status: { $ne: "deleted" } };

    if (status !== "") {
      filter.status = status;
    } else {
      filter.status = { $ne: "deleted" };
    }

    if (search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }
    const total = await Role.countDocuments(filter);

    const roles = await Role.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("permissions");

    res.json({
      totalRoles: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      roles
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET ROLE BY ID
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate("permissions");

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ROLE
const updateRole = async (req, res) => {
  try {
    const { name, permissions, status } = req.body;

    const processedPermissions = await getPermissionStrings(Permission, permissions);

    const updated = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name,
        permissions: processedPermissions,
        status
      },
      { new: true }
    ); // Populate so frontend gets the names back;
    req.io.emit("roleUpdated", updated);
    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  SOFT DELETE ROLE
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, {
      status: "deleted"
    });
    req.io.emit("roleDeleted", role._id);
    res.json({ message: "Role deleted (soft delete)" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRole, getRoles, getRoleById, updateRole, deleteRole };
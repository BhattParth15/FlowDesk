const Role = require("../models/role_Schema.js");
const Permission = require("../models/permission_Schema.js");
const isSuperAdmin = require("../middleware/isSuperAdmin_Middleware.js");
const mongoose = require("mongoose");


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

    if (!status) {
      return res.status(400).json({ message: "Please select Status" });
    }

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        message: "At least one permission must be selected"
      });
    }
    name = name.trim();
    const processedPermissions = await getPermissionStrings(Permission, permissions);
    const existing = await Role.findOne({ name });
    if (existing) {
      if (existing.status === "deleted") {
        existing.status = status || "Active";
        existing.name = name;
        existing.permissions = processedPermissions;
        await existing.save();
        req.io.emit("roleCreated", existing);
        return res.json({ type: "success", message: "Role Created successfully" });
      }
      // If already active → error
      return res.status(400).json({
        message: "Role already exists"
      });
    }

    const role = await Role.create({
      name,
      permissions: processedPermissions,
      status,
      companyId: req.user.companyId
    });

    req.io.emit("roleCreated", role);

    res.status(201).json({ type: "success", message: "Role Created Successfully.", role });

  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: error.message });
  }
};

//GET ALL ROLES (Pagination)
const getRoles = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 1000;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const isSuperAdmin = req.user.isSuperAdmin;
    const queryCompanyId = req.query.companyId;
    const skip = (page - 1) * limit;

    const filter = { status: { $ne: "deleted" } };
   
    if (isSuperAdmin) {
      if (queryCompanyId && queryCompanyId !== "all") {
        filter.companyId = new mongoose.Types.ObjectId(queryCompanyId);
      }
    } else {
      filter.companyId = new mongoose.Types.ObjectId(req.user.companyId);
    }

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
    const roleId = req.params.id;
    let { name, permissions, status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Please select Status" });
    }
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        message: "At least one permission must be selected"
      });
    }
    // Check role exists
    const existingRole = await Role.findById(roleId);
    if (!existingRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Duplicate name check (only if changed)
    if (name !== existingRole.name) {
      const nameExists = await Role.findOne({ name });
      if (nameExists) {
        return res.status(400).json({
          message: "Role name already exists"
        });
      }
    }

    const processedPermissions = await getPermissionStrings(Permission, permissions);

    const updated = await Role.findByIdAndUpdate(
      roleId,
      {
        name,
        permissions: processedPermissions,
        status
      },
      { new: true, runValidators: true }
    );
    req.io.emit("roleUpdated", updated);
    res.json({ type: "success", message: "Role Updated Successfully.", updated });

  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
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
    res.json({ type: "success", message: "Role Deleted Successfully." });

  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: error.message });
  }
};
const updateCompanyOwnerPermissions = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { permissions } = req.body;

    // Find CompanyOwner role
    const role = await Role.findOne({
      name: "CompanyOwner",
      companyId
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Update permissions
    role.permissions = permissions;
    await role.save();

    res.json({
      message: "Permissions updated successfully",
      role
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRole, getRoles, getRoleById, updateRole, deleteRole, updateCompanyOwnerPermissions };
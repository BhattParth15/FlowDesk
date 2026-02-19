const Permission = require("../models/permission_Schema.js");


//CREATE PERMISSION
const createPermission = async (req, res) => {
  try {
    let { name, status } = req.body;

    const value = name.toLowerCase().replace(/\s+/g, "_");

    const existing = await Permission.findOne({ value });
    if (existing) {
      // If deleted → restore
      if (existing.status === "deleted") {
        existing.status = "Active";
        await existing.save();
        req.io.emit("PermissionCreated", permission);
        return res.json({ message: "Permission restored successfully" });
      }
      // If already active → error
      return res.status(400).json({
        message: "Permission already exists"
      });
    }

    const permission = await Permission.create({
      name,
      value,
      status
    });

    req.io.emit("PermissionCreated", permission);

    res.status(201).json(permission);

  } catch (error) {
    res.status(500).json({ message: "Permission Create Error", error });
  }
};


//GET ALL PERMISSIONS (Pagination)

const getPermissions = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const skip = (page - 1) * limit;

    const filter = {
      status: { $ne: "deleted" }
    };

    if (status && status !== "") {
      filter.status = status;
    } else {
      filter.status = { $ne: "deleted" };
    }

    //Add search condition if provided
    if (search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }
    const total = await Permission.countDocuments(filter);

    const permissions = await Permission.find(filter)
      .skip(skip)
      .limit(limit);

    res.json({
      totalPermissions: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      permissions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET PERMISSION BY ID
const getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    res.json(permission);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//UPDATE PERMISSION
const updatePermission = async (req, res) => {
  try {
    const { name, status } = req.body;

    const value = name.toLowerCase().replace(/\s+/g, "_");

    const updated = await Permission.findByIdAndUpdate(
      req.params.id,
      { name, value, status },
      { new: true }
    );
    req.io.emit("PermissionUpdated", updated);
    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//   SOFT DELETE PERMISSION
const deletePermission = async (req, res) => {
  try {
    const per = await Permission.findByIdAndUpdate(req.params.id, {
      status: "deleted"
    });

    req.io.emit("PermissionDeleted", per._id);

    res.json({ message: "Permission deleted (soft delete)" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPermissions, createPermission, getPermissionById, updatePermission, deletePermission };
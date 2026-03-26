const User = require("../models/User_Schema.js");
const bcrypt = require("bcryptjs");
const generatePassword = require("../utils/generate_Password.js");
const Project = require("../models/project_Schema.js")
const sendEmail = require("../utils/send_Email.js");
const Email_Template = require("../utils/Email_Template.js");

const createStaff = async (req, res) => {
  try {
    let { name, email, phone, role, status } = req.body;

    const password = generatePassword();
    const hashed = await bcrypt.hash(password, 10);

    if (!email && !name && !phone) {
      return res.status(400).json({ message: "All Data required" });
    }
    if (!role) {
      return res.status(400).json({ message: "Please select Role" });
    }
    if (!status) {
      return res.status(400).json({ message: "Please select Status" });
    }
    email = email.trim().toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      // If deleted → restore
      if (existing.status === "deleted") {
        existing.status = status || "Active";
        existing.name = name;
        existing.role = role;
        existing.phone = phone;
        existing.password = hashed;
        await existing.save();
        req.io.emit("staffCreated", existing);
        return res.json({ type: "success", message: "Staff Created successfully" });
      }

      // If already active → error
      return res.status(400).json({
        message: "Staff already exists"
      });
    }
    const staff = await User.create({
      name,
      email,
      phone,
      role,
      status,
      password: hashed,
      companyId: req.user.companyId
    });
    const Path = `/?redirect=/staff/${name._id}`;
    const emailBody = `
          <p>Your account has been successfully created in <b>Task Manager App</b>.</p>
          <p>You can now use the credentials below to log in and start managing your work.</p>
          <p><b>Login Credentials:</b><br>
          <b>Password:</b>${password}<br>
          <b>Email:</b>${email}<br>
          <p>Please click the button below to login and get started:</p>
          `;
    const html = Email_Template(
      name,
      emailBody,
      {
        type: "Login Credentials",
        label: "Login Now",
        link: Path
      },
      "Task Manager"
    );
    sendEmail({
      to: email,
      subject: "Task Manager App Login Credentials",
      html
    });
    req.io.emit("staffCreated", staff);
    res.json({ type: "success", message: "Staff Created Successfully.", staff, password });
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const getStaff = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const search = req.query.search || "";
  const status = req.query.status || "";
  const isSuperAdmin = req.user.isSuperAdmin;
  const queryCompanyId = req.query.companyId;
  const skip = (page - 1) * limit;

  const filter = { status: { $ne: "deleted" }, isSuperAdmin: false };

  if (isSuperAdmin) {
    if (queryCompanyId && queryCompanyId !== "all") {
      filter.companyId = queryCompanyId; 
    }
  } else {
    filter.companyId = req.user.companyId;
  }
  
  if (status && status !== "") {
    filter.status = status;
  } else {
    filter.status = { $ne: "deleted" };
  }

  if (search.trim() !== "") {
    filter.name = { $regex: search.trim(), $options: "i" };
  }
  const totalStaff = await User.countDocuments(filter);

  const staff = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("role");

  res.json({
    totalStaff,
    currentPage: page,
    totalPages: Math.ceil(totalStaff / limit),
    staff
  });
};
//Update Task By Admin
const updateStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    let { email, name, role, phone, status } = req.body;
    if (!role) {
      return res.status(400).json({ message: "Please select Role" });
    }
    if (!status) {
      return res.status(400).json({ message: "Please select Status" });
    }
    const existingUser = await User.findById(staffId);

    if (!existingUser) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const updateData = {};
    let isEmailChanged = false;

    // ✅ Only check duplicate if email changed
    if (email) {
      email = email.trim().toLowerCase();

      if (email !== existingUser.email) {
        const emailExists = await User.findOne({ email });

        if (emailExists) {
          return res.status(400).json({
            message: "Email already in use"
          });
        }
        isEmailChanged = true;
      }
      updateData.email = email;
    }

    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (phone) updateData.phone = phone;
    if (status) updateData.status = status;
    let password;
    if (isEmailChanged) {
      password = generatePassword();
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }
    const update = await User.findByIdAndUpdate(
      staffId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!update) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    const Path = `/?redirect=/staff/${name._id}`;
    if (isEmailChanged) {
      const emailBody = `
          <p>Your account has been successfully updated in <b>Task Manager App</b>.</p>
          <p>You can now use the credentials below to log in and start managing your work.</p>
          <p><b>New Login Credentials:</b><br>
          <b>Password:</b>${password}<br>
          <b>Email:</b>${email}<br>
          <p>Please click the button below to login and get started:</p>
          `;
      const html = Email_Template(
        name,
        emailBody,
        {
          type: "Login Credentials",
          label: "Login Now",
          link: Path
        },
        "Task Manager"
      );
      sendEmail({
        to: email,
        subject: "Task Manager App Login Credentials",
        html
      });
    }
    req.io.emit("staffUpdated", update);
    res.json({ type: "success", message: "Staff Updated Successfully.", update });
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: "Server error" });
  }
};

//Delete Task By Admin
const deleteStaff = async (req, res) => {
  const staff = await User.findByIdAndUpdate(req.params.id, { status: "deleted" });
  req.io.emit("staffDeleted", staff._id);
  res.json({ type: "success", message: "Staff Deleted Successfully.", });
}

const getStaffByProject = async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }
    const staff = await User.find({ _id: { $in: project.assignedUser }, status: { $ne: "deleted" } })
      .select("_id name email phone status");
    res.json({
      totalStaff: staff.length,
      staff
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Get Staff Error", error: error.message });
  }
};

module.exports = { getStaff, createStaff, updateStaff, deleteStaff, getStaffByProject };

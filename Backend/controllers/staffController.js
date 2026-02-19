const User = require("../models/User_Schema.js");
const bcrypt = require("bcryptjs");
const generatePassword = require("../utils/generate_Password.js");
const sendEmail = require("../utils/send_Email.js");

const createStaff = async (req, res) => {
  let { name, email, phone, role, status } = req.body;

  const password = generatePassword();
  const hashed = await bcrypt.hash(password, 10);

  if (!email || !name || !phone) {
    return res.status(400).json({ message: "All Data required" });
  }
  email =  email.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    // If deleted → restore
    if (existing.status === "deleted") {
      existing.status = "Active";
      await existing.save();
      req.io.emit("staffCreated", existing);
      return res.json({ message: "Staff restored successfully" });
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
    password: hashed
  });

  sendEmail(
    email,
    "Your New Login Password",
    `Welcome to Task Manager App.

Your account has been created successfully.

Your login password is: ${password}

Please login.

Regards,
Task Manager Team`
  );
  req.io.emit("staffCreated", staff);
  res.json({ staff, password });
};

const getStaff = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const search = req.query.search || "";
  const status=req.query.status || "";
  const skip = (page - 1) * limit;

  const filter = {status: { $ne: "deleted" },isSuperAdmin: false};

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
  const staffId = req.params.id;
  const { email, name, role, phone, status } = req.body;
  const update = await User.findByIdAndUpdate(
    staffId,
    {
      email: email.trim().toLowerCase(),
      name, role, phone, status
    },
    { new: true }
  );
  sendEmail(
    email,
    "Your Account Updated",
    `Hello,

Your account details have been updated successfully in Task Manager App.

If you did not request this update, please contact the administrator immediately.

Regards,
Task Manager Team`
  );

  req.io.emit("staffUpdated", update);
  res.json(update);
};

//Delete Task By Admin
const deleteStaff = async (req, res) => {
  const staff = await User.findByIdAndUpdate(req.params.id, { status: "deleted" });
  req.io.emit("staffDeleted", staff._id);
  res.json({ message: "Task deleted" });
}

module.exports = { getStaff, createStaff, updateStaff, deleteStaff };

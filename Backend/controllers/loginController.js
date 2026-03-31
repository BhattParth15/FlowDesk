const User = require("../models/User_Schema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/send_Email.js");
const generatePassword = require("../utils/generate_Password.js");

require("dotenv").config();

const getRedirectPath = (user) => {
  if (user.isSuperAdmin) {
    return "/dashboard";
  }

  if (user.role?.name === "CompanyOwner") {
    return "/company-profile";
  }

  const hasDashboardModule = user.companyId?.subscription?.modules?.some(
    (m) => m.name === "dashboard"
  );
  return hasDashboardModule ? "/dashboard" : "/staff";
};
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (email.length > 100) {
      return res.status(400).json({ message: "Email must be under 100 characters" });
    }

    const user = await User.findOne({ email })
      .populate({
        path: "role",
        populate: { path: "permissions" }
      })
      .populate({
        path: "companyId",
        populate: {
          path: "subscription", 
        }
      });
    if (!user) {
      return res.status(400).json({ message: "User not fount" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role?._id, companyId: user.companyId, isSuperAdmin: user.isSuperAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,       // REQUIRED (DevTunnel = HTTPS)
      sameSite: "none",   // REQUIRED for cross-origin
      path: "/",          // good practice
    });

    const redirectTo = getRedirectPath(user);

    res.json({
      token,
      name: user.name,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      role: {
        id: user.role?._id,
        name: user.role?.name,
        permissions: user.role?.permissions
      },
      redirectTo
    });

  }
  catch {
    res.status(500).json({ message: "Internal Server Error" })
  }
};

// FORGOT PASSWORD (Generate New Password Every Time)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate new password
    const newPassword = generatePassword();

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update in DB
    user.password = hashedPassword;
    await user.save();

    // Send password to email
    await sendEmail(
      email,
      "Your New Login Password",
      `Your new password is: ${newPassword}`
    );

    res.json({ message: "New password sent to your email" });
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    res.status(500).json({ message: "Error sending email" });
  }
};


const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logout Success" });
};

//Show Login Data
const getMe = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(200).json({
      id: null,
      permissions: []
    });
  }
  const user = await User.findById(req.user.id).populate("role", "name permissions");
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    status: user.status,
    isSuperAdmin: user.isSuperAdmin,
    role: user.role?.name || user.role || null,
    permissions: user.isSuperAdmin ? ["ALL"] : user.role?.permissions || []
  });
};

module.exports = { Login, forgotPassword, logout, getMe };
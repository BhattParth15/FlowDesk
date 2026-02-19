const User = require("../models/User_Schema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/send_Email.js");
const generatePassword = require("../utils/generate_Password.js");

require("dotenv").config();


const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate({ path: "role", populate: { path: "permissions" } });
    if (!user) {
      return res.status(400).json({ message: "User not fount" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role?._id, isSuperAdmin: user.isSuperAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true });

    res.json({
      token,
      name: user.name,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      role: {
        id: user.role?._id,
        name: user.role?.name,
        permissions: user.role?.permissions
      }
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
  const user = await User.findById(req.user.id).populate("role", "name permissions");
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    status:user.status,
    isSuperAdmin: user.isSuperAdmin,
    role: user.role || null,
    permissions: user.isSuperAdmin? ["ALL"] : user.role?.permissions || []
  });
};

module.exports = { Login, forgotPassword, logout, getMe };
const User = require("../models/User_Schema.js");

const isStaffOwner = async (req, res, next) => {
  const staff = await User.findById(req.params.id);

  if (!staff) {
    return res.status(404).json({ message: "Staff not found" });
  }

  if (!req.user.isSuperAdmin &&
      staff._id.toString() !== req.user.id) {

    return res.status(403).json({
      message: "You can modify only your own profile"
    });
  }

  next();
};

module.exports = isStaffOwner;


const Role = require("../models/role_Schema.js");

const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      // Super Admin → allow everything
      if (req.user.isSuperAdmin) {
        return next();
      }

      //If no role in token
      if (!req.user.role) {
        return res.status(403).json({ message: "No role assigned" });
      }

      //Get role (No need to .populate because we are using strings)
      const role = await Role.findById(req.user.role);

      if (!role) {
        return res.status(403).json({ message: "Role not found" });
      }

      //Construct the string to search for (e.g., "staff.read")
      const requiredPermission = `${moduleName.toLowerCase()}.${action.toLowerCase()}`;

      //Check if the string exists in the permissions array
      const hasPermission = role.permissions.includes(requiredPermission);

      if (!hasPermission) {
        return res.status(403).json({
          message: `Permission check failed: Missing ${requiredPermission}`,
        });
      }
      next();
    } catch (error) {
      console.error("Permission Error:", error);
      res.status(500).json({ message: "Internal server error during permission check" });
    }
  };
};

module.exports = checkPermission;

const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Role Name is required"],
    maxlength: [20, "Role name cannot be longer than 20 characters"],
    minlength: [2, "Role name cannot be shorter than 2 characters"],
    match: [/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"]
  },
  permissions: [
    {
      type: String,
      trim: true
    }
  ],
  status: {
    type: String,
    enum: ["Active", "Inactive", "Deleted"],
    default: "Active"
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);

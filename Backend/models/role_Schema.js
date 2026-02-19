const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
  }
},{ timestamps: true });

module.exports = mongoose.model("Role", roleSchema);

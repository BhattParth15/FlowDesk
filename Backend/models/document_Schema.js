const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Document name is required"],
        trim: true,
        maxlength: [100, "Document name cannot exceed 100 characters"]
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"]
    },
    documentType: {
        type: String,
        enum: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "image", "other"],
        required: [true, "Document type is required"]
    },
    // File attachment info
    file: [{
        fileName: {
            type: String,
            required: true
        },

        originalName: {
            type: String,
            required: true
        },

        fileUrl: {
            type: String,
            required: true
        },

        publicId: {
            type: String   // cloudinary public_id (for delete)
        },
        mimeType: {
            type: String,
            required: true
        },
        size: {
            type: Number,  // in bytes
            required: true
        }
    }],
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Users who can access document
    allowedUsers: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            permission: {
                type: String,
                enum: ["view", "edit"],
                default: "view"
            }
        }

    ],
    // Access request tracking
    accessRequests: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            status: {
                type: String,
                enum: ["pending", "approved", "denied"],
                default: "pending"
            },
            requestedAt: {
                type: Date,
                default: Date.now
            },
            respondedAt: {
                type: Date
            }
        }
    ],
    // Status
    status: {
        type: String,
        enum: ["Active", "deleted"],
        default: "Active"
    },
    // Audit fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String  //For CK Editor
    },
    isPaginated: {
        type: Boolean,
        default: false
    },
    access: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            permission: {
                type: String,
                enum: ["view", "edit"],
                default: "view"
            },
        }
    ],
    // companyId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Company",
    //     required: true
    // },
}, {timestamps: true}
);

module.exports = mongoose.model("Document", documentSchema);
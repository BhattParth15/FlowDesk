const mongoose = require("mongoose");

const documentPageSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true
    },
    pageNumber: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    size: {
        type: Number
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("DocumentPage", documentPageSchema);
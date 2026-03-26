const mongoose = require('mongoose');

const company_Schema = new mongoose.Schema({
    companyName: {
        type: String,
        trim: true,
        required: [true, "Company Name is required"],
        maxlength: [30, "Company Name cannot be longer than 30 characters"],
        minlength: [2, "Company Name cannot be shorter than 2 characters"],
        match: [/^[a-zA-Z\s]+$/, "Company Name can only contain letters and spaces"]
    },
    GSTNumber: {
        type: String,
        required: [true, "GST number is required"],
        unique: true
    },
    companyEmail: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        maxlength: [30, "Email is maximum 30 characters"],
        match: [/\S+@\S+\.\S+/, "Please provide a valid email address"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        minlength: [10, "Phone number must be at least 10 digits"],
        maxlength: [10, "Phone number is maximum 10 digits"],
        match: [/^\d+$/, "Phone can only contain numbers"]
    },
    companyAddress: {
        type: String,
        required: [true, "Company Address is required"],
        maxlength: [300, "Address is maximum 300 characters"],
    },
    companyType:
    {
        type: String,
        enum: ["IT Services", "Software Development", "Consulting", "Manufacturing", "Finance / Banking", "Healthcare", "E-commerce", "Logistics / Transportation"],
        require: true
    },
    ownerName: {
        type: String,
        required: [true, "Owner Name is required"],
        maxlength: [30, "Owner Name cannot be longer than 30 characters"],
        minlength: [2, "Owner Name cannot be shorter than 2 characters"],
        match: [/^[a-zA-Z\s]+$/, "Owner Name can only contain letters and spaces"]
    },
    ownerEmail: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        maxlength: [30, "Email is maximum 30 characters"],
        match: [/\S+@\S+\.\S+/, "Please provide a valid email address"]
    },

    ownerPhone: {
        type: String,
        required: [true, "Phone number is required"],
        minlength: [10, "Phone number must be at least 10 digits"],
        maxlength: [10, "Phone number is maximum 10 digits"],
        match: [/^\d+$/, "Phone can only contain numbers"]
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Deleted"],
        default: "Active"
    },
    subscription: {
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlan"
        },
        //snapshot of modules at purchase time
        modules: [
            {
                name: String,
                limit: Number,
                bulkLimit: Number
            }
        ],
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ["active", "expired"],
            default: "active"
        }
    },
    timing: {
        openingTime: String,
        closingTime: String,
        breakStart: String,
        breakEnd: String,

        workingDays: [{
            day: String,
            isOpen: { type: Boolean, default: true }
        }],

        holidays: [{
            date: Date,
            title: String
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model("Company", company_Schema);
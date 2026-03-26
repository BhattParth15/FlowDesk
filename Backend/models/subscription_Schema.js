const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: true,
        trim: true
    },
    billingCycle: {
        type: String,
        enum: ["Monthly", "Quarterly", "Half-Yearly", "Yearly"],
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    modules: [
        {
            moduleName: String,   
            limit: Number       
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
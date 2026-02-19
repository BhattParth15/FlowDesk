const mongoose=require("mongoose");

const taskSchema=new mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String,
        required:true
    },
    image: {
        type: [String], 
        default: []
    },

    video:{
        type:String,
        default:"video.png"
    },
    taskStatus:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"TaskStatus"
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum: ["Active", "Inactive", "Deleted"],
        default:"Active"
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
    
},{ timestamps: true });

module.exports=mongoose.model("Task",taskSchema);
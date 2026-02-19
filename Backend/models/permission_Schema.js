const mongoose=require("mongoose");

const permissionSchema=new mongoose.Schema({
    name:String,
    value:String,
    status:{
        type:String,
        enum:["Active","Inactive","Deleted"],
        default:"Active"
    }
},{ timestamps: true });

module.exports=mongoose.model("Permission",permissionSchema);
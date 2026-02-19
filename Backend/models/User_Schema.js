const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String,
    },
    phone:{
        type:String,
        retuied:true,
        
    },
    password:{
        type:String,
        // required:true
    },
    role:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Role"
    },
    isSuperAdmin:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:["Active","Inactive","Deleted"],
        default:"Active"
    },
});

module.exports=mongoose.model("User",userSchema);
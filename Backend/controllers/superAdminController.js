const bcrypt = require("bcryptjs");
const User=require("../models/User_Schema.js")

async function createAdmin(){
    const existingAdmin = await User.findOne({ email: "parthbhatt.cbtlpl@gmail.com" });
    if (existingAdmin) {
      console.log("Super Admin already exists");
      return;
    }
    const hashed=await bcrypt.hash("Pgbhatt$1524",10);

    await User.create({
        name:"Parth Bhatt",
        email:"parthbhatt.cbtlpl@gmail.com",
        password:hashed,
        isSuperAdmin:true
    });
    console.log("Admin Created");
}

module.exports=createAdmin;
const bcrypt = require("bcryptjs");
const User=require("../models/User_Schema.js");
const Role=require("../models/role_Schema.js");

async function createAdmin(){
    const existingAdmin = await User.findOne({ email: "parthbhatt.cbtlpl@gmail.com" });
    if (existingAdmin) {
      console.log("Super Admin already exists");
      return;
    }
    const hashed=await bcrypt.hash("Pgbhatt$1524",10);

    const roleDoc = await Role.findOne({ name: "SuperAdmin" });
    if (!roleDoc) {
      console.log("SuperAdmin role not found. Create it first!");
      return;
    }
    await User.create({
        name:"Parth Bhatt",
        email:"parthbhatt.cbtlpl@gmail.com",
        password:hashed,
        isSuperAdmin:true,
        role: roleDoc._id,
        phone: "6354394642"
    });
    console.log("Admin Created");
}

module.exports=createAdmin;
const mongoose = require("mongoose");

//Database Connection
const Dbconnection = () => mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDb Connected..."))
    .catch(error => console.log("DB Connection Error.", error))

module.exports=Dbconnection;
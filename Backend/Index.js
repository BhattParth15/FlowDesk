const express=require("express");
const Dbconnection=require("./config/Db_connection.js");
const LoginRoutes=require("./routes/authRoutes.js");
const TaskRoutes=require("./routes/taskRoutes.js");
const StaffRoutes=require("./routes/staffRoutes.js");
const PermissionRoutes=require("./routes/permissionRoutes.js");
const RoleRoutes=require("./routes/roleRoutes.js");
const TaskStatusRouter=require("./routes/taskStatusRoutes.js");
const http =require("http");
const { Server } =require( "socket.io");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const cors = require("cors");


require("dotenv").config();
const createSuperAdmin=require("./controllers/superAdminController.js")

const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

//Database Connection Call
Dbconnection();

createSuperAdmin();

// app.get("/", (req, res) => {
//   res.status(200).send("Backend Running");
// });


// Create HTTP server
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Make io available in routes via middleware
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Optional: log connections
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

//Valid Login
app.use("/auth",LoginRoutes);
app.use("/task",TaskRoutes);
app.use("/staff", StaffRoutes);
app.use("/role", RoleRoutes);
app.use("/permission", PermissionRoutes);
app.use("/taskstatus",TaskStatusRouter);


// Global Error Handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ 
                message: "Video or Image size Max 10MB" 
            });
        }
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
    next();
});


server.listen(process.env.PORT ,()=>{
    console.log(`Server runing on: http://localhost:${process.env.PORT}`);
});
import axios from "axios";
import { useState } from "react"

function SuperAdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "error" or "success"

    const showMessage = (msg, type = "error") => {
        setMessage(msg);
        setMessageType(type);
        // Automatically hide after 2 seconds
        setTimeout(() => setMessage(""), 2000);
    };

    const adminLogin = async () => {
        if (!email || !password) {
            showMessage("Email and Password are required")
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            showMessage("Please enter a valid email address");
            return;
        }

        try {
            const res = await axios.post("http://localhost:9824/auth/login", { email, password }, {
                withCredentials: true
            });

            //localStorage.setItem("token", res.data.token);
            localStorage.setItem("name", res.data.name);
            localStorage.setItem("email", res.data.email);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("isSuperAdmin", res.data.isSuperAdmin);
            localStorage.setItem("permissions", JSON.stringify(res.data.role.permissions));
            //console.log("Login Response:", res.data);
            
            showMessage("Login Successful...","success");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1000);
        }
        catch (error) {
            console.log(error)
            showMessage(error.response?.data?.message || "Login Failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {/* Message Box */}
            {message && (
                <div
                    className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-20 py-3 rounded shadow-lg text-white z-50 
                        ${messageType === "error" ? "bg-red-400" : "bg-green-300"
                        }`}
                >
                    {message}
                </div>
            )}

            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>
                <br></br>
                <div className="space-y-4">
                    <label>Email</label>
                    <input
                        type="text"
                        placeholder="Enter Your Email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <br></br>
                    <br></br>
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter Your Password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <br></br>
                    <br></br>
                    <button
                        onClick={adminLogin}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Login
                    </button>

                </div>
            </div>
        </div>

    );
}
export default SuperAdminLogin;
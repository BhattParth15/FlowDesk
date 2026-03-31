import axios from "axios";
import { useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function SuperAdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "error" or "success"
    const [showPassword, setShowPassword] = useState(false);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const redirect = searchParams.get("redirect") || "/dashboard";

    const showMessage = (msg, type = "error") => {
        setMessage(msg);
        setMessageType(type);
        // Automatically hide after 2 seconds
        setTimeout(() => setMessage(""), 2000);
    };

    //  // If user is already logged in and a redirect query exists, go directly
    // useEffect(() => {
    //     if (user && redirect) {
    //         navigate(redirect, { replace: true });
    //     }
    // }, [user, redirect, navigate]);


    const adminLogin = async () => {
        if (!email.trim()) {
            showMessage("Email is required");
            return;
        }
        if (!password.trim()) {
            showMessage("Password is required");
            return;
        }
        if (email.length > 50) {
            showMessage("Email must be under 50 characters");
            return;
        }
        if (password.length < 8) {
            showMessage("Password must be 8 characters");
            return;
        }
        if (password.length > 20) {
            showMessage("Password must be under 20 characters");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage("Please enter a valid email address");
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password }, {
                withCredentials: true
            });
            login(res.data);
            const redirectPath = res.data.redirectTo;
            showMessage("Login Successful...", "success");
            setTimeout(() => {
                window.location.href = redirectPath;
            }, 2000);
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
                        ${messageType === "error" ? "bg-red-400" : "bg-green-400"
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
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Your Password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                        >
                            {/* {showPassword ? "🔒" : "👁"} */}
                            {showPassword ? <Eye size={23} /> : <EyeOff size={23} />}
                        </button>

                    </div>
                    <br></br>
                    <br></br>
                    <button
                        onClick={adminLogin}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Login
                    </button>
                    <p className="text-center mt-4 text-sm text-gray-600">
                        <span
                            onClick={() => navigate("/company-register")}
                            className="text-blue-600 cursor-pointer hover:underline"
                        >
                            Register Company
                        </span>
                    </p>
                </div>
            </div>
        </div>

    );
}
export default SuperAdminLogin;
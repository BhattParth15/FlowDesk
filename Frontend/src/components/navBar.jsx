import { Link } from "react-router-dom";
import Profile from "../pages/Profile";
import logo from "../assets/logo.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


function Navbar() {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef();

    useEffect(() => {
        const storedName = localStorage.getItem("name");
        if (storedName) {
            setName(storedName);
        }
    }, []);


    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <header className="w-full h-17 bg-blue-400 flex items-center justify-between px-8 text-white shadow-md z-10 flex gap-3">
            <div className="flex items-center gap-3">
                <div className="p-3 flex justify-center">
                    <img src={logo} className="w-10 h-10" alt="logo" />
                </div>
                <h1 className="text-sm font-bold tracking-tight">
                    Task Manager
                </h1>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                        <span className="font-medium text-base">
                            Welcome, {name || "User"}
                        </span>
                        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                            ▼
                        </span>
                    </div>
                    {open && (
                        <div className="absolute right-0 mt-3 w-40 bg-white text-black rounded-lg shadow-lg border z-50">
                            <div
                                onClick={() => {
                                    navigate("/profile");
                                    setOpen(false);
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                Profile
                            </div>
                            <div
                                onClick={logout}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500">
                                Logout
                            </div>

                        </div>
                    )}

                </div>
            </div>

        </header>
    );
}
export default Navbar;
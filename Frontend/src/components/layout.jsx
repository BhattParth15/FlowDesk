import { Outlet } from "react-router-dom";
import Sidebar from "./sideBar";
import Navbar from "./navBar";
import { useState, useEffect } from "react";
import axios from "axios";

function Layout({ children }) {
    const [Error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [confirmAction, setConfirmAction] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => {
                // Handle success messages from backend
                if (response.data?.type === "success" && response.data?.message) {
                    setSuccess(response.data.message);
                    setTimeout(() => setSuccess(""), 2000);
                }
                return response;
            },
            (error) => {
                // Handle errors (keep your existing logic)
                if (error.response) {
                    const message = error.response.data?.message || error.response.data?.msg || "Something went wrong";
                    setError(message);
                    setTimeout(() => setError(""), 5000);
                }
                return Promise.reject(error);
            }
        );
        // Cleanup on unmount
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);



    return (
        <div className="h-screen flex flex-col overflow-hidden">

            {Error && (
                <div className="fixed top-8 right-10 z-[9999] bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow-xl border border-red-200 font-medium">
                    {Error}
                    {confirmAction && (
                        <div className="space-x-2">
                            <button
                                onClick={() => {
                                    confirmAction();
                                    setConfirmAction(null);
                                    setError("");
                                }}
                                className="bg-white text-red-600 px-3 py-1 rounded"
                            >
                                Yes
                            </button>

                            <button
                                onClick={() => {
                                    setConfirmAction(null);
                                    setError("");
                                }}
                                className="bg-gray-200 text-black px-3 py-1 rounded"
                            >
                                No
                            </button>
                        </div>
                    )}
                </div>
            )}
            {success && (
                <div className="fixed top-8 right-10 z-[9999] bg-green-100 text-green-700 px-10 py-3 rounded-lg shadow-xl border border-green-200 font-medium">
                    {success}
                </div>
            )}

            <div className="flex flex-1 relative overflow-hidden">

                {/* Mobile Overlay */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 bg-opacity-40 lg:hidden z-50"
                        onClick={() => setIsOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div
                    className={`
                fixed lg:static
                top-0 left-0
                w-64
                z-50
                h-full
                transform transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0
            `}
                >
                    <Sidebar closeSidebar={() => {
                        if (window.innerWidth < 1024) {
                            setIsOpen(false);
                        }
                    }} />
                </div>

                {/* Right Section */}
                <div className="flex flex-col flex-1  ">

                    <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />

                    <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto bg-gray-100">
                        <Outlet />
                    </main>

                </div>

            </div>
        </div>
    )
}
export default Layout;
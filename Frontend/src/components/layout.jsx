import { Outlet } from "react-router-dom";
import Sidebar from "./sideBar";
import Navbar from "./navBar";
import { useState, useEffect } from "react";
import axios from "axios";

function Layout({ children }) {
    const [Error, setError] = useState("");
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    const message = error.response.data?.message || error.response.data?.msg || "Something went wrong";
                    setError(message);
                    // Auto hide after 5 seconds
                    setTimeout(() => {
                        setError("");
                    }, 5000);
                }

                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);




    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            {Error && (
                <div className="bg-red-100 text-red-700 px-6 py-3 text-center font-medium">
                    {Error}

                    {confirmAction && (
                        <div className="space-x-2">
                            <button
                                onClick={() => {
                                    confirmAction();   // run delete
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
            {/* Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto bg-slate-60 p-4 ">
                    <Outlet />
                </main>

            </div>
        </div>
    )
}
export default Layout;
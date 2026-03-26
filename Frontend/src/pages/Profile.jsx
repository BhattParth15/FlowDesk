import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfirmModal } from "../context/DeleteConfirmContext";

const API_URL = import.meta.env.VITE_API_URL;

function Profile() {
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { showConfirm } = useConfirmModal();

    useEffect(() => {
        fetchProfile();
    }, [location.pathname]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
            console.log("Error:", err.response?.data || err.message);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 p-6 flex flex-col items-center">
            
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="self-start flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition duration-300 font-medium"
            >
               ← Back
            </button>

            {/* Profile Card */}
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md mt-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    My Profile
                </h3>

                <div className="space-y-4 text-gray-700 mt-4">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p>
                        <strong>Status:</strong>{" "}
                        <span className={`px-2 py-1 rounded-full text-white ${user.status === "Active" ? "bg-green-400" : "bg-red-400"}`}>
                            {user.status}
                        </span>
                    </p>
                    <p><strong>Role:</strong> {user.role?.name || "SuperAdmin"}</p>
                </div>
            </div>
        </div>
    );
}

export default Profile;
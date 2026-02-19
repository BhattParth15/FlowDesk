import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Profile() {
    const [user, setUser] = useState(null);
    const location=useLocation();

    useEffect(() => {
        fetchProfile();
    },[location.pathname]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get("http://localhost:9824/auth/me",
                { withCredentials: true })
            
            localStorage.setItem("user", JSON.stringify(res.data));
            console.log(res.data);
            console.log("Response:", res.data);
            setUser(res.data);
        }

        catch (err) {
            console.log("Error:", err.response?.data || err.message);
        }
        if (!user) {
            return <p>Loading...</p>;
        }
    }

    return (
        <div className="p-6" >
            <h2 className="page-title">My Profile</h2>
            <div >
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Status:</strong> <span className="badge-active">{user?.status}</span></p>
                <p><strong>Super Admin:</strong> {user?.isSuperAdmin ? "Yes" : "No"}</p>
            </div>
        </div>
    );
}

export default Profile;

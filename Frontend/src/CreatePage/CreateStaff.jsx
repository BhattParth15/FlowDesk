import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePermission } from "../context/PermissionContext";


function CreateStaff() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();
    const { hasPermission } = usePermission();

    // 1. Initialize state with whatever is in location.state, or an empty array
    const [rolesList, setRolesList] = useState(state?.roles || state?.availableRoles || []);

    useEffect(() => {
            const fetchRoles = async () => {

                try {
                    // Replace this URL with your actual roles endpoint
                    const res = await axios.get("http://localhost:9824/role", { withCredentials: true });
                    // Handle different response structures
                    if (Array.isArray(res.data)) {
                        setRolesList(res.data);
                    } else if (res.data && Array.isArray(res.data.data)) {
                        setRolesList(res.data.data);
                    } else if (res.data && Array.isArray(res.data.roles)) {
                        setRolesList(res.data.roles);
                    }
                } catch (error) {
                    console.error("Error fetching roles:", error);
                }
            }
        if (rolesList.length === 0) {
            if (hasPermission("role.read")) {
                fetchRoles();
            }
        }
    }, [rolesList.length,hasPermission]);

    return (
        <div className="main-container">
            <ReuseForm
                title={id ? "Edit Staff" : "Create Staff"}
                method={id ? "put" : "post"}
                apiUrl={id ? `http://localhost:9824/staff/${id}` : "http://localhost:9824/staff"}
                fields={[
                    {
                        name: "name",
                        label: "Name",
                        fieldType: "input",
                        type: "text",
                        placeholder: "Write Your Name"
                    },
                    {
                        name: "email",
                        label: "Email",
                        fieldType: "input",
                        type: "email",
                        placeholder: "Enter Your Email"
                    },
                    {
                        name: "phone",
                        label: "Mobile Number",
                        fieldType: "input",
                        type: "number",
                        placeholder: "Enter Mobile Number"
                    },
                    {
                        name: "role",
                        label: "Select Role",
                        fieldType: "select",
                        placeholder: "Select Role",
                        options: hasPermission("role.read") ? (Array.isArray(rolesList) ? rolesList : []).map(r => ({
                            label: r.name,
                            value: r._id || r.id || "" // Ensure it's not undefined
                        })).filter(opt => opt.value !== "") : []// Only show roles that have valid IDs
                    },
                    // {
                    //     name: "isSuperAdmin",
                    //     label: "Super Admin",
                    //     fieldType: "select",
                    //     placeholder: "Select You Are Super Admin",
                    //     options: [{ label: "Yes", value: true },
                    //     { label: "No", value: false }
                    //     ]
                    // },
                    {
                        name: "status",
                        label: "Select Status",
                        fieldType: "select",
                        placeholder: "Select Your Status",
                        options: [
                            { label: "Active", value: "Active" },
                            { label: "Inactive", value: "Inactive" },
                            { label: "Deleted", value: "Deleted" }
                        ]
                    },
                ]}
                initialData={state}
                onClose={() => navigate("/staff")}
                onSuccess={() => navigate("/staff")}
            />
        </div>
    );
}
export default CreateStaff;
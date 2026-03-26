import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePermission } from "../context/PermissionContext";
import { useCompany } from "../context/companyContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;


function CreateStaff() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();
    const { hasPermission } = usePermission();
    const {selectedCompany}=useCompany();

    // 1. Initialize state with whatever is in location.state, or an empty array
    const [rolesList, setRolesList] = useState(state?.roles || state?.availableRoles || []);

    useEffect(() => {
        const fetchRoles = async () => {

            try {
                // Replace this URL with your actual roles endpoint
                //const res = await axios.get(`${API_URL}/role`, { withCredentials: true });
                let url = `${API_URL}/role?page=1&limit=1000`;
                if (selectedCompany && selectedCompany._id !== "all") {
                    url += `&companyId=${selectedCompany._id}`;
                }
                const res = await axios.get(url, { withCredentials: true });
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
    }, [rolesList.length,selectedCompany, hasPermission]);

    return (
        <div className="main-container">
            <ReuseForm
                title={id ? "Edit Staff" : "Create Staff"}
                method={id ? "put" : "post"}
                apiUrl={id ? `${API_URL}/staff/${id}` : `${API_URL}/staff`}
                fields={[
                    {
                        name: "name",
                        label: "Name",
                        required: true,
                        fieldType: "input",
                        type: "text",
                        placeholder: "Write Your Name"
                    },
                    {
                        name: "email",
                        label: "Email",
                        required: true,
                        fieldType: "input",
                        type: "email",
                        placeholder: "Enter Your Email"
                    },
                    {
                        name: "phone",
                        label: "Mobile Number",
                        required: true,
                        fieldType: "input",
                        type: "input",
                        placeholder: "Enter Mobile Number"
                    },
                    {
                        name: "role",
                        label: "Select Role",
                        fieldType: "select",
                        placeholder: "Select Role",
                        options: hasPermission("role.read") ? (Array.isArray(rolesList) ? rolesList : [])
                            .filter(r => r.name !== "SuperAdmin")
                            .map(r => ({
                                label: r.name,
                                value: r._id || r.id || ""
                            })).filter(opt => opt.value !== "") : []
                    },
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
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePermission } from "../context/PermissionContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function CreateProject() {
    const [staff, setStaff] = useState([]);
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();
    const { hasPermission } = usePermission();
    
    

    useEffect(() => {
        if (hasPermission("staff.read")) {
            fetchStaff();
        }
    }, [hasPermission]);

    const fetchStaff = async () => {
        try {
            const res = await axios.get(`${API_URL}/staff?page=1&limit=1000`, { withCredentials: true });
            setStaff(res.data.staff);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    return (
        <div className="main-container">
            <ReuseForm
                title={id ? "Edit Project" : "Create Project"}
                method={id ? "put" : "post"}
                apiUrl={id ? `${API_URL}/project/${id}` : `${API_URL}/project`}
                fields={[
                    {
                        name: "name",
                        label: "Project",
                        fieldType: "input",
                        required: true,
                        type: "text",
                        placeholder: "Write Your Project Name",
                    },
                    {
                        name: "description",
                        label: "Description",
                        required: true,
                        fieldType: "textarea",
                        type: "text",
                        placeholder: "Write Project's Description"
                    },
                    {
                        name: "assignedUser",
                        label: "Assignee",
                        required: true,
                        fieldType: "multiselect",
                        options: hasPermission("staff.read")?staff.map((s) => ({
                            label: s.name,
                            value: s._id
                        })):[]
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
                onClose={() => navigate("/project")}
                onSuccess={() => navigate("/project")}
            />
        </div>
    );
}
export default CreateProject;
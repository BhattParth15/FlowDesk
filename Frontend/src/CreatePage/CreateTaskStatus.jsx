import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePermission } from "../context/PermissionContext.jsx";
import { useProject } from "../context/ProjectContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function CreateTaskStatus() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();

    const { hasPermission } = usePermission();
    const { selectedProject } = useProject();


    return (
        <div className="main-container">
            <ReuseForm
                title={id ? "Edit TaskStatus" : "Create TaskStatus"}
                method={id ? "put" : "post"}
                apiUrl={id ? `${API_URL}/taskstatus/${id}` : `${API_URL}/taskstatus`}
                fields={[
                    {
                        name: "name",
                        required: true,
                        label: "Status Name",
                        fieldType: "input",
                        placeholder: "Enter Status Name"
                    },
                    {
                        name: "status",
                        required: true,
                        label: "Status",
                        fieldType: "select",
                        options: [
                            { label: "Active", value: "Active" },
                            { label: "Inactive", value: "Inactive" },
                            { label: "Deleted", value: "Deleted" }
                        ],
                    },
                   
                ]}
                initialData={state}
                onClose={() => navigate("/taskstatus")}
                onSuccess={() => navigate("/taskstatus")}
            />
        </div>
    );
}
export default CreateTaskStatus;
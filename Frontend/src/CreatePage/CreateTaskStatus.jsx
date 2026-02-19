import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePermission } from "../context/PermissionContext.jsx";

function CreateTaskStatus() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();

    const {hasPermission}=usePermission();

    return (
        <div className="main-container">
            <ReuseForm
                title={id ? "Edit TaskStatus" : "Create TaskStatus"}
                method={id ? "put" : "post"}
                apiUrl={id ? `http://localhost:9824/taskstatus/${id}` : "http://localhost:9824/taskstatus"}
                fields={[
                    {
                        name: "name",   
                        label: "Status Name",
                        fieldType: "input",
                        placeholder: "Enter Status Name"
                    },
                    {
                        name: "status",
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
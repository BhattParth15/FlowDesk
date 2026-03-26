import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePermission } from "../context/PermissionContext.jsx";
import { useProject } from "../context/ProjectContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function CreateDocument() {
    const [staff, setStaff] = useState([]);
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();

    const { hasPermission } = usePermission();
    const { selectedProject } = useProject();

    useEffect(() => {
        if (!selectedProject?._id) return;

        if (hasPermission("staff.read")) {
            fetchStaff();
        }

    }, [hasPermission, selectedProject]);

    const fetchStaff = async () => {
        try {
            const res = await axios.get(
                `${API_URL}/staff/project?projectId=${selectedProject._id}&page=1&limit=1000`,
                { withCredentials: true }
            );
            setStaff(res.data.staff);
            console.log(res.data.staff);
        }
        catch (err) {
            console.log(err.response?.data || err.message);
        }
    };

    return (
        <div className="main-container">
            <ReuseForm
                title={id ? "Edit Document" : "Create Document"}
                method={id ? "put" : "post"}
                apiUrl={id ? `${API_URL}/document/${id}`: `${API_URL}/document`}
                fields={[
                    {
                        name: "name",
                        label: "Document Name",
                        fieldType: "input",
                        required: true,
                        type: "text",
                        placeholder: "Write Your Document Name",
                    },
                    {
                        name: "documentType",
                        label: "Document Type",
                        required: true,
                        fieldType: "select",
                        options: [
                            { label: "PDF", value: "pdf" },
                            { label: "DOC", value: "doc" },
                            { label: "DOCX", value: "docx" },
                            { label: "PPT", value: "ppt" },
                            { label: "PPTX", value: "pptx" },
                            { label: "XLS", value: "xls" },
                            { label: "XLSX", value: "xlsx" }
                        ]
                    },
                     {
                        name: "description",
                        label: "Description",
                        required: true,
                        fieldType: "textarea",
                        placeholder: "Enter Description"
                    },
                    {
                        name: "file",
                        label: "Upload Document",
                        required: !id,
                        fieldType: "file",
                        type: "file"
                    },
                    {
                        name: "allowedUsers",
                        label: "Assign Members",
                        required: true,
                        fieldType: "multiselect",
                        options: hasPermission("staff.read")
                            ? staff.map((s) => ({
                                label: s.name,
                                value: s._id
                            }))
                            : []
                    }
                ]}
                initialData={state}
                onClose={() => navigate("/document")}
                onSuccess={() => navigate("/document")}
            />
        </div>
    );
}
export default CreateDocument;
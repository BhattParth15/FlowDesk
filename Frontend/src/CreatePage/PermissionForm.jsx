import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";

function PermissionForm() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();

    // This logic mimics your backend: Lowercase + Spaces to Underscore
    const formatValue = (name) => {
        return name ? name.toLowerCase().trim().replace(/\s+/g, '_') : "";
    };

    return (
        <div className="main-container">
            <ReuseForm
                title={id ? "Edit Permission" : "Create Permission"}
                method={id ? "put" : "post"}
                apiUrl={id ? `http://localhost:9824/permission/${id}` : "http://localhost:9824/permission"}
                fields={[
                    { 
                        name: "name", 
                        fieldType: "input", 
                        type: "text", 
                        placeholder: "e.g. User Management" 
                    },
                    { 
                        name: "value", 
                        fieldType: "input", 
                        type: "text", 
                        placeholder: "auto_generated_value",
                        disabled: true, // Keep it disabled so only backend/logic controls it
                        transform: (val, allValues) => formatValue(allValues.name) // Auto-fill logic
                    },
                    {
                        name: "status",
                        fieldType: "select",
                        options: [
                            { label: "Active", value: "Active" },
                            { label: "Inactive", value: "Inactive" },
                            {label:"Deleted",value:"Deleted"}
                        ],
                    },
                ]}
                initialData={state}
                onClose={() => navigate("/permission")}
                onSuccess={() => navigate("/permission")}
            />
        </div>
    );
}
export default PermissionForm;
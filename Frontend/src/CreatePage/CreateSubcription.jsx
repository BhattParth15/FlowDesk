import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReuseForm from "../components/reuseForm.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function SubcriptionForm() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();

    return (
        <div className="main-container">
            <ReuseForm
                title={id ? "Edit Subscription Plan" : "Create Subscription Plan"}
                method={id ? "put" : "post"}
                apiUrl={id ? `${API_URL}/subcription/${id}` : `${API_URL}/subcription`}

                fields={[
                    {
                        name: "planName",
                        required: true,
                        fieldType: "input",
                        type: "text",
                        placeholder: "e.g. Premium Plan"
                    },
                    {
                        name: "billingCycle",
                        required: true,
                        fieldType: "select",
                        options: [
                            { label: "Monthly", value: "Monthly" },
                            { label: "Quarterly", value: "Quarterly" },
                            { label: "Half-Yearly", value: "Half-Yearly" },
                            { label: "Yearly", value: "Yearly" }
                        ]
                    },
                    {
                        name: "price",
                        required: true,
                        fieldType: "input",
                        type: "number",
                        placeholder: "Enter price"
                    },
                    {
                        name: "isActive",
                        fieldType: "select",
                        options: [
                            { label: "Active", value: true },
                            { label: "Inactive", value: false }
                        ]
                    },
                    {
                        name: "modules",
                        fieldType: "modules",
                        options :[
                            { label: "Dashboard", value: "dashboard" },
                            { label: "Role", value: "role" },
                            { label: "Staff", value: "staff" },
                            { label: "Manage Project", value: "project" },
                            { label: "Task Management", value: "task" },
                            { label: "Issue", value: "issue" },
                            { label: "Team", value: "team" },
                            { label: "Task Status", value: "taskstatus" },
                            { label: "Permission", value: "permission" },
                            { label: "Document", value: "document" },
                            { label: "Bulk Upload", value: "bulkupload" }
                        ]
                    }
                ]}

                initialData={state}
                onClose={() => navigate("/subcription")}
                onSuccess={() => navigate("/subcription")}
            />
        </div>
    );
}

export default SubcriptionForm;
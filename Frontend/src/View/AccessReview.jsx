import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { useProject } from "../context/ProjectContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function AccessReview() {
    const { documentId } = useParams();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("userId");
    const navigate = useNavigate();
    const { selectedProject } = useProject();

    const [document, setDocument] = useState(null);

    useEffect(() => {
        
        fetchDocument();
    }, []);

    const fetchDocument = async () => {
        const res = await axios.get(`${API_URL}/document`, { withCredentials: true });
        setDocument(res.data.data);
    };

    const updateAccess = async (status) => {
        
        await axios.post(`${API_URL}/document/update-access`, { documentId, userId, status }, { withCredentials: true }
        );
        navigate("/document");
    };

    if (!document) return <div>Loading...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-[400px] text-center">
                <h2 className="text-xl font-bold mb-4">Access Request</h2>

                <div className="mb-6">
                    <p>Hello,</p>

                    <p>
                        A user has requested access to the project
                        <strong>{document?.projectName}</strong>.
                    </p>

                    <p>
                        This request indicates that the user currently does not have permission
                        to view or download the associated documents within this project.
                    </p>

                    <p>
                        If you approve this request, the user will be granted access and added
                        to the list of authorized members for this document. They will then be
                        able to securely view the document from their dashboard.
                    </p>

                    <p>
                        If you deny the request, the user will be notified via email that their
                        access request has been declined.
                    </p>

                    <p>
                        Please review the request carefully and choose one of the options below:
                    </p>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => updateAccess("approved")}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Approve
                    </button>

                    <button
                        onClick={() => updateAccess("denied")}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Denied
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AccessReview;
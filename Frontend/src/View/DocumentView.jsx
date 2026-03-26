import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeader from "../components/Pageheader.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function ViewDocument() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [documentData, setDocumentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
        fetchDocument();
    }, [id]);

    const fetchDocument = async () => {
        try {
            const res = await axios.get(
                `${API_URL}/document/view/${id}`,
                { withCredentials: true }
            );
            setDocumentData(res.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "You do not have access to this document"
            );
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIXED openSecureFile
    const openSecureFile = (url, fileName) => {
        if (!url) return;

        const extension = fileName.split(".").pop().toLowerCase();
        let finalUrl = url;

        if (["doc", "docx", "ppt", "pptx"].includes(extension)) {
            finalUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
        }

        const newTab = window.open("", "_blank");
        if (!newTab) return;

        newTab.document.open();   // ✅ correct
        newTab.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${fileName}</title>
                    <style>
                        body { margin: 0; background: #f3f4f6; }
                        iframe {
                            width: 100%;
                            height: 100vh;
                            border: none;
                        }
                    </style>
                </head>
                <body>
                    <iframe src="${finalUrl}"></iframe>
                </body>
            </html>
        `);
        newTab.document.close();  // ✅ correct
    };

    const downloadFile = async (url, fileName) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);
            const link = window.document.createElement("a");

            link.href = blobUrl;
            link.download = fileName || "file";

            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading document...</div>;
    }

    if (error) {
        return (
            <div className="p-6">
                <PageHeader
                    title="View Document"
                    onBack={() => navigate("/document")}
                />
                <div className="bg-red-100 text-red-700 px-6 py-4 rounded mt-4">
                    {error}
                </div>
            </div>
        );
    }

    if (!documentData) return null;

    return (
        <div className="p-6">
            <PageHeader
                title="View Document"
                onBack={() => navigate("/document")}
            />

            <div className="bg-white shadow rounded-lg p-6 mt-4 space-y-4">
                <div>
                    <label className="block font-semibold">Description</label>
                    <p>{documentData.description}</p>
                </div>
                <span>
                    <label className="block font-semibold">Document Type</label><p>{documentData.documentType?.toUpperCase()}</p>
                </span>
                <div>
                    <label className="block font-semibold ">Owner</label>
                    <p>{documentData.ownerId?.name}</p>
                </div>
                <div>
                    <label className="block font-semibold">Created At</label>
                    <p>{new Date(documentData.createdAt).toLocaleString()}</p>
                </div>
                {documentData?.file?.length > 0 && (
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() =>
                                openSecureFile(
                                    documentData.file[0].fileUrl,
                                    documentData.file[0].originalName
                                )
                            }
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        >
                            View Document
                        </button>

                        <button
                            onClick={() =>
                                downloadFile(
                                    documentData.file[0].fileUrl,
                                    documentData.file[0].originalName
                                )
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Download
                        </button>
                    </div>
                )}
            </div>
            <br></br>
            <button
                onClick={() => navigate(-1)}
                className="self-start flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition duration-300 font-medium"
            >
               ← Back
            </button>
            <br></br>
        </div>
    );
}

export default ViewDocument;
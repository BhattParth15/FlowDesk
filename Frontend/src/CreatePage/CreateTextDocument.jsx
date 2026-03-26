
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { useProject } from "../context/ProjectContext.jsx";
import { usePermission } from "../context/PermissionContext.jsx";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const API_URL = import.meta.env.VITE_API_URL;

function CreateTextDocument() {

    const navigate = useNavigate();
    const { selectedProject } = useProject();
    const { hasPermission } = usePermission();
    const [fileType, setFileType] = useState("txt");
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    // const mode = searchParams.get("mode");
    // const isViewMode = mode === "view";
    const location = useLocation();
    const navDoc = location.state?.doc || null;

    const isViewMode = location.pathname.includes("/view-text/");

    const [docId, setDocId] = useState(null);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("Untitled");
    const [Error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    const [autoSave, setAutoSave] = useState(
        JSON.parse(localStorage.getItem("autoSave")) ?? true
    );

    const [staff, setStaff] = useState([]);
    const [access, setAccess] = useState([]);
    const [isAccessOpen, setIsAccessOpen] = useState(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (!navDoc) return;
        setDocId(navDoc._id);
        setTitle(navDoc.name);
        setFileType(navDoc.documentType || "txt");
    }, [navDoc]);

    // Load page-wise content from DocumentPage collection
    useEffect(() => {
        if (!docId) return;

        setLoading(true);

        const pageToLoad = isViewMode ? currentPage : 1; // view mode: current page, edit: start first page

        axios
            .get(`${API_URL}/document/pages/${docId}?page=${pageToLoad}`, { withCredentials: true })
            .then(res => {
                const docData = res.data;
                const pagesData = docData.data || [];

                setPages(pagesData);
                setTotalPages(docData.totalPages || 1);
                setTitle(docData.name);
                setFileType(docData.documentType || "txt");
                setAccess((docData.allowedUsers || []).map(u => ({
                    userId: u.userId,
                    permission: u.permission,
                    _id: u._id
                })));
                console.log("Allow:", docData.allowedUsers)

                if (isViewMode) {
                    setDocId(docData._id);
                    setTitle(docData.name);
                    setAccess(docData.access || []);
                    setFileType(docData.documentType || "txt");

                    if (fileType === "txt") {
                        setContent(pagesData.map(p => p.content).join(""));
                    } else if (fileType === "docx") {
                        setCurrentPage(pageToLoad);
                        //setContent(pagesData[0]?.content || "<p></p>");
                    }
                } else {
                    // EDIT MODE
                    if (fileType === "txt") {
                        const fullContent = pagesData.map(p => p.content).join("");
                        setContent(fullContent);
                    } else if (fileType === "docx") {
                        setCurrentPage(1);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading document pages:", err);
                setLoading(false);
            });
    }, [docId, fileType, currentPage, isViewMode]);

    useEffect(() => {
        if (fileType === "docx" && currentPage > pages.length) {
            setCurrentPage(pages.length || 1);
        }
    }, [pages, currentPage, fileType]);

    useEffect(() => {
        if (!selectedProject?._id) return;
        if (hasPermission("staff.read")) {
            axios.get(`${API_URL}/staff/project?projectId=${selectedProject._id}&page=1&limit=1000`,
                { withCredentials: true }
            )
                .then(res => setStaff(res.data.staff || []))
                .catch(err => console.error(err));
        }
    }, [selectedProject, hasPermission]);

    useEffect(() => {
        if (!autoSave) return;
        if (isViewMode) return;
        if (!content) return;
        if (!docId) return;

        const timer = setTimeout(() => {
            saveDocument(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, [content, pages, docId]);

    useEffect(() => {

        if (fileType === "docx" && pages.length === 0) {
            setPages([{ pageNumber: 1, content: "<p></p>" }]);
            setCurrentPage(1);
        }

        if (fileType === "txt" && pages.length > 0) {
            // DOC → TXT
            const merged = pages.map(p => p.content).join("");
            setContent(merged);
        }

    }, [fileType]);

    const toggleAutoSave = () => {
        const value = !autoSave;
        setTimeout(() => {
            setAutoSave(value);
        }, 1000);
        localStorage.setItem("autoSave", JSON.stringify(value));
    };
    const saveDocument = async (isAuto = false) => {
        try {
            let finalPages = [];

            if (fileType === "txt") {
                if (!content.trim()) return setError("Content cannot be empty");
                finalPages = splitIntoPages(
                    fileType === "txt"
                        ? content
                        : pages.map(p => p.content).join("")
                );
            } else {
                // Ensure pages state exists
                if (!pages || pages.length === 0) {
                    finalPages = [{ pageNumber: 1, content: content || "<p></p>" }];
                } else {
                    const fullContent = pages.map(p => p.content).join("");
                    if (!fullContent.trim()) {
                        return setError("Document cannot be empty");
                    }
                    finalPages = pages.map((p, index) => ({
                        pageNumber: index + 1,
                        content: p.content || "<p></p>"
                    }));

                }
                // Validate that at least one page has content
                const hasContent = finalPages.some(p => {
                    const text = (p.content || "").replace(/<[^>]*>/g, "").trim();
                    return text.length > 0;
                });

                if (!hasContent) return setError("Document cannot be empty");
            }

            // fallback
            if (finalPages.length === 0) finalPages = [{ pageNumber: 1, content: "<p></p>" }];

            const usersArray = access?.map(a => ({
                userId: a.userId,
                permission: a.permission || "view" // default to "view" if not set
            })) || [];
            const payload = {
                name: title,
                pages: finalPages,
                documentType: fileType,
                projectId: selectedProject?._id,
                allowedUsers: usersArray
            };

            // CREATE
            if (!docId) {
                const res = await axios.post(`${API_URL}/document/create-paged`, payload, { withCredentials: true });
                setDocId(res.data._id);
                if (!isAuto) navigate("/document");
            }
            // UPDATE
            else {
                await axios.put(`${API_URL}/document/page/${docId}`, payload, { withCredentials: true });
                if (!isAuto) {
                    setSuccess("Text Document Updated successfully");
                    setTimeout(() => navigate("/document"), 2000);
                }
            }

            // Clear previous error if saved successfully
            setError("");

        } catch (err) {
            console.log("Save Error:", err);

        }
    };

    const splitIntoPages = (html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        // ✅ Keep HTML (not innerText)
        const content = tempDiv.innerHTML;

        const size = 1500; // adjust for page size

        const pages = [];

        for (let i = 0; i < content.length; i += size) {
            pages.push({
                pageNumber: pages.length + 1,
                content: content.slice(i, i + size)
            });
        }

        return pages.length
            ? pages
            : [{ pageNumber: 1, content: "<p></p>" }];
    };

    const handleToggleUser = (user) => {
        setAccess(prev => {
            const exists = prev.find(a => a.userId === user._id);
            if (exists) {
                return prev.filter(a => a.userId !== user._id);
            }
            return [
                ...prev,
                { userId: user._id, permission: "view", name: user.name }
            ];
        });
    };

    const handlePermissionToggle = (userId) => {
        setAccess(prev =>
            prev.map(a =>
                a.userId === userId
                    ? { ...a, permission: a.permission === "view" ? "edit" : "view" }
                    : a
            )
        );
    };

    return (
        <div className="min-h-screen bg-gray-300 font-sans text-slate-900">

            {/* --- Topbar --- */}
            <header className=" top-0 z-50 bg-blue-600 text-white shadow-sm h-12 flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/document")} className="p-1 hover:bg-blue-500 rounded transition">
                        ←
                    </button>
                    {!isViewMode && (
                        <div>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-sm font-bold bg-blue-500/20 px-2 py-1 rounded outline-none text-white"
                                placeholder="Untitled Document"
                            />
                            <select
                                value={fileType}
                                onChange={(e) => setFileType(e.target.value)}
                                className="text-xs font-bold text-white bg-blue-500/20 rounded px-2 cursor-pointer"
                            >
                                <option value="txt">.txt</option>
                                <option value="docx">.docx</option>
                            </select>
                        </div>
                    )}
                    {isViewMode && (
                        <div className="flex items-center gap-4">
                        <h6 className="text-sm font-semibold mt-2 text-white px-3 py-1 rounded-md truncate max-w-[250px]">{title}   .{fileType}</h6>
                        
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {!isViewMode && (
                        <>
                            {!autoSave && (
                                <button
                                    onClick={() => saveDocument(false)}
                                    className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs font-bold"
                                >
                                    Save
                                </button>
                            )}
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded">
                                <span className="text-xs">Auto Save</span>
                                <button
                                    onClick={toggleAutoSave}
                                    className={`w-8 h-4 flex items-center rounded-full px-0.5 transition ${autoSave ? "bg-green-500" : "bg-gray-400"}`}
                                >
                                    <div className={`bg-white w-3 h-3 rounded-full transition-transform ${autoSave ? "translate-x-4" : "translate-x-0"}`} />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsAccessOpen(!isAccessOpen)}
                                className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs font-bold"
                            >
                                Share
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* --- Floating Notifications --- */}
            {Error && (
                <div className="fixed top-14 right-6 z-[10000] bg-red-600 text-white px-6 py-2 rounded shadow-lg font-semibold">
                    {Error}
                </div>
            )}
            {success && (
                <div className="fixed top-14 right-6 z-[10000] bg-green-600 text-white px-6 py-2 rounded shadow-lg font-semibold">
                    {success}
                </div>
            )}

            {/* --- Document Workspace --- */}
            <main className="py-8 flex flex-col items-center gap-6">

                {/* Staff/Access Dropdown */}
                {isAccessOpen && !isViewMode && (
                    <div className="absolute top-35 right-9 w-80 bg-white shadow-lg rounded-lg border border-gray-200 p-3 max-h-60 overflow-y-auto z-[9999]">
                        {staff.map(user => {
                            const userAccess = access.find(a => a.userId === user._id);
                            const isSelected = !!userAccess;
                            return (
                                <div key={user._id} className={`flex justify-between items-center p-2 px-3 rounded-md border ${isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-100"}`}>
                                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleToggleUser(user)}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold">{user.name}</span>
                                    </div>
                                    {isSelected && (
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold uppercase ${userAccess.permission === "edit" ? "text-blue-600" : "text-gray-400"}`}>
                                                {userAccess.permission}
                                            </span>
                                            <button
                                                onClick={() => handlePermissionToggle(user._id)}
                                                className={`w-7 h-3.5 flex items-center rounded-full px-0.5 transition-colors ${userAccess.permission === "edit" ? "bg-blue-600" : "bg-gray-300"}`}
                                            >
                                                <div className={`bg-white w-2.5 h-2.5 rounded-full transition-transform ${userAccess.permission === "edit" ? "translate-x-3" : "translate-x-0"}`} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pages Container */}
                <div className="flex flex-col items-center gap-6" key={fileType}>

                    {!isViewMode ? (
                        // ✅ EDIT MODE (Single Editor)
                        <div className="flex flex-col items-center">

                            {/* ✅ PAGE CONTAINER */}
                            <div className="relative bg-white shadow-lg border border-gray-300 w-[794px] min-h-[1123px] px-10 py-12">

                                <CKEditor
                                    editor={ClassicEditor}
                                    data={
                                        fileType === "txt"
                                            ? content
                                            : (pages[currentPage - 1]?.content ?? "<p></p>")
                                    }
                                    onChange={(event, editor) => {
                                        const value = editor.getData();

                                        if (fileType === "txt") {
                                            setContent(value);
                                        } else {
                                            const updatedPages = [...pages];

                                            updatedPages[currentPage - 1] = {
                                                ...updatedPages[currentPage - 1],
                                                content: value
                                            };

                                            setPages(updatedPages);

                                            // ✅ SMART PAGE ADD (smooth)
                                            setTimeout(() => {
                                                const editorEl = document.querySelector(".ck-editor__editable");

                                                if (!editorEl) return;

                                                if (editorEl.scrollHeight > 1135) {

                                                    // ✅ GET TEXT CONTENT
                                                    const tempDiv = document.createElement("div");
                                                    tempDiv.innerHTML = value;

                                                    const text = tempDiv.innerHTML;

                                                    // 🔥 SPLIT CONTENT (IMPORTANT)
                                                    const splitIndex = Math.floor(text.length * 0.7);

                                                    const firstPart = text.slice(0, splitIndex);
                                                    const secondPart = text.slice(splitIndex);

                                                    // ✅ UPDATE CURRENT PAGE
                                                    updatedPages[currentPage - 1].content = firstPart;

                                                    // ✅ CHECK NEXT PAGE
                                                    if (currentPage === pages.length) {
                                                        updatedPages.push({
                                                            pageNumber: pages.length + 1,
                                                            content: secondPart || "<p></p>"
                                                        });
                                                    } else {
                                                        updatedPages[currentPage].content = secondPart;
                                                    }

                                                    setPages([...updatedPages]);
                                                }
                                            }, 100);

                                        }
                                    }}
                                />

                                {/* ✅ PAGE NUMBER */}
                                {fileType === "docx" && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                                        Page {currentPage}
                                    </div>
                                )}
                            </div>

                            {/* ✅ PAGE NAVIGATION (ONLY DOCX) */}
                            {fileType === "docx" && (
                                <div className="flex items-center gap-4 mt-4">

                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        ◀ Prev
                                    </button>

                                    <span className="text-sm font-semibold">
                                        {currentPage} / {pages.length}
                                    </span>

                                    <button
                                        disabled={currentPage === pages.length}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        Next ▶
                                    </button>

                                    {/* ✅ MANUAL ADD PAGE */}
                                    <button
                                        onClick={() => {
                                            setPages(prev => [
                                                ...prev,
                                                {
                                                    pageNumber: prev.length + 1,
                                                    content: "<p></p>"
                                                }
                                            ]);
                                        }}
                                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                                    >
                                        + Add Page
                                    </button>

                                </div>
                            )}

                        </div>
                    ) : (
                        <>
                            {/* ✅ VIEW MODE */}

                            {fileType === "txt" ? (
                                <div className="bg-white shadow-lg border w-[794px] min-h-[1123px] p-8">
                                    <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: pages.map(p => p.content).join("")
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-8">
                                    {pages.map((page) => (
                                        <div
                                            key={page.pageNumber}
                                            className="relative bg-white shadow-lg border w-[794px] min-h-[1123px] px-10 py-12"
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{ __html: page.content }}
                                            />

                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                                                Page {page.pageNumber}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                </div>
            </main>

            {/* --- Global CSS for CKEditor + Page --- */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .ck-editor__editable {
            min-height: 1000px !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            overflow-y: auto !important;
            overflow: hidden !important;
            padding: 40px !important;
        }
        .ck-toolbar {
            position: sticky !important;
            top: 48px !important; /* below topbar */
            background: white !important;
            z-index: 40;
            border-bottom: 1px solid #e2e8f0 !important;
        }
    `}} />

        </div>
    );
}

export default CreateTextDocument;
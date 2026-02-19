// import axios from "axios";
// import { useState, useEffect } from "react";
// import { usePermission } from "../context/PermissionContext";

// function ReuseForm({ title, fields, apiUrl, method = "post", onClose, onSuccess, initialData }) {
//     const [Formdata, setFormData] = useState({});
//     const [loading, setLoading] = useState(false);

//     const [previewImages, setPreviewImages] = useState([]);
//     const [previewVideo, setPreviewVideo] = useState(null);
//     const { hasPermission } = usePermission();


//     useEffect(() => {
//         if (initialData) {
//             const prefilled = {};
//             fields.forEach((field) => {
//                 // For select fields, pick _id if object
//                 if (initialData[field.name] && typeof initialData[field.name] === "object") {
//                     prefilled[field.name] = initialData[field.name]._id || "";
//                 } else {
//                     prefilled[field.name] = initialData[field.name] || "";
//                 }
//             });
//             setFormData(prefilled);

//             // Preview Images: handle array of URLs or Files
//             if (initialData.image) {
//                 const imgs = Array.isArray(initialData.image)
//                     ? initialData.image.map((img) =>
//                         img instanceof File ? URL.createObjectURL(img) : img
//                     )
//                     : [initialData.image];
//                 setPreviewImages(imgs);
//             }

//             // Preview Video: handle File or URL
//             if (initialData.video) {
//                 const videoSrc =
//                     initialData.video instanceof File
//                         ? URL.createObjectURL(initialData.video)
//                         : initialData.video;
//                 setPreviewVideo(videoSrc);
//             }
//         } else {
//             const emptyData = {};
//             fields.forEach((field) => (emptyData[field.name] = ""));
//             setFormData(emptyData);
//             setPreviewImages([]);
//             setPreviewVideo(null);
//         }
//     }, [initialData, fields]);


//     const handleChange = (e, field) => {
//         if (field.type === "image") {
//             const files = Array.from(e.target.files);
//             setFormData({ ...Formdata, [field.name]: files });
//             setPreviewImages(files.map((f) => URL.createObjectURL(f)));
//         } else if (field.type === "video") {
//             const file = e.target.files[0];
//             setFormData({ ...Formdata, [field.name]: file });
//             setPreviewVideo(file ? URL.createObjectURL(file) : null);
//         } else {
//             setFormData({ ...Formdata, [field.name]: e.target.value });
//         }
//     };


//     const submitData = async () => {
//         try {
//             setLoading(true);
//             const data = new FormData();

//             Object.keys(Formdata).forEach((key) => {
//                 const value = Formdata[key];

//                 // 1. Handle Multiple Files (Images)
//                 if (Array.isArray(value)) {
//                     value.forEach((v) => {
//                         // Only append if it's an actual File object, not a string URL
//                         if (v instanceof File) {
//                             data.append(key, v);
//                         }
//                     });
//                 }
//                 // 2. Handle Single File (Video)
//                 else if (value instanceof File) {
//                     data.append(key, value);
//                 }
//                 // 3. Handle Regular Text/ID Data
//                 else if (value !== null && value !== undefined) {
//                     data.append(key, value);
//                 }
//             });
//             await axios({
//                 url: apiUrl,
//                 method: method,
//                 data: data,
//                 headers: { "Content-Type": "multipart/form-data" },
//                 withCredentials: true
//             });
//             onSuccess();
//             onClose();
//         } catch (error) {
//             console.log(error.response?.data || error);
//         } finally {
//             setLoading(false);  // ✅ Stop loading (always runs)
//         }
//     };

//     return (
//         <div className="bg-white rounded-xl shadow p-1 w-full max-w-lg mx-auto my-4">
//             <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">

//                 {/* Title */}
//                 <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
//                     {title}
//                 </h3>

//                 {/* Form Fields */}
//                 <div className="space-y-5">
//                     {fields.map((field) => {
//                         return (
//                             <div key={field.name} className="flex flex-col gap-1.5">
//                                 {/* LABEL ONLY FOR NON-FILE FIELDS */}
//                                 {field.fieldType !== "file" && (
//                                     <label className="text-sm font-semibold text-gray-700 capitalize">
//                                         {field.label || field.name.replace(/([A-Z])/g, ' $1')}
//                                     </label>
//                                 )}

//                                 {/* INPUT FIELD */}
//                                 {field.fieldType === "input" && (
//                                     <input
//                                         type={field.type}
//                                         name={field.name}
//                                         value={(Formdata[field.name] || "")}
//                                         placeholder={field.placeholder}
//                                         onChange={(e) => handleChange(e, field)}
//                                         disabled={field.disabled}
//                                         //readOnly={field.readOnly}
//                                         className="w-full border border-gray-300 rounded-md px-4 py-2 
//                                                     focus:ring-2 focus:ring-red-400 focus:outline-none transition-all"
//                                     />
//                                 )}

//                                 {/* SELECT FIELD */}
//                                 {field.fieldType === "select" && (
//                                     <select
//                                         value={Formdata[field.name] || ""}
//                                         onChange={(e) =>
//                                             setFormData({ ...Formdata, [field.name]: e.target.value })
//                                         }
//                                         className="w-full border border-gray-300 rounded-md px-4 py-2 
//                                         focus:ring-2 focus:ring-red-400 focus:outline-none bg-white transition-all"

//                                     >
//                                         <option value="">Select {field.label || field.name}</option>
//                                         {field.options.map((opt) => (
//                                             <option key={opt.value} value={opt.value}>
//                                                 {opt.label}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 )}

//                                 {/* MULTI SELECT */}
//                                 {field.fieldType === "multiselect" && (
//                                     <select
//                                         multiple
//                                         value={Formdata[field.name] || []}
//                                         onChange={(e) => {
//                                             const selected = Array.from(
//                                                 e.target.selectedOptions
//                                             ).map((opt) => opt.value);
//                                             setFormData({
//                                                 ...Formdata,
//                                                 [field.name]: selected,
//                                             });
//                                         }}
//                                         className="w-full border border-gray-300 rounded-md px-4 py-2 
//                                         focus:ring-2 focus:ring-red-400 focus:outline-none transition-all min-h-[100px]"
//                                     >
//                                         {field.options.map((opt) => (
//                                             <option key={opt.value} value={opt.value}>
//                                                 {opt.label}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 )}
//                                 {field.fieldType === "file" && (
//                                     <div className="flex flex-col gap-1.5">
//                                         <label className="text-sm font-semibold text-gray-700 capitalize">
//                                             {field.label || field.name.replace(/([A-Z])/g, ' $1')}
//                                         </label>

//                                         <input
//                                             type="file"
//                                             name={field.name}
//                                             onChange={(e) => handleChange(e, field)}
//                                             multiple={field.type === "image"} // multiple for images only
//                                             accept={field.type === "image" ? "image/*" : field.type === "video" ? "video/*" : undefined}
//                                             className="w-full border border-gray-300 rounded-md px-4 py-2
//                                                     focus:ring-2 focus:ring-red-400 focus:outline-none transition-all"
//                                         />

//                                         {/* Preview Images */}
//                                         {field.type === "image" && previewImages.length > 0 && (
//                                             <div className="flex flex-wrap gap-2 mt-2">
//                                                 {previewImages.map((img, idx) =>
//                                                     img ? ( // ✅ render only if img is truthy
//                                                         <img
//                                                             key={idx}
//                                                             src={img}
//                                                             alt={`preview-${idx}`}
//                                                             className="w-20 h-20 object-cover rounded border cursor-pointer"
//                                                             onClick={() => window.open(img, "_blank")}
//                                                         />
//                                                     ) : null
//                                                 )}
//                                             </div>
//                                         )}

//                                         {/* Preview Video */}
//                                         {field.type === "video" && previewVideo && (
//                                             <video width="200" height="120" controls className="mt-2 rounded border" onClick={() => window.open(previewVideo, "_blank")}>
//                                                 <source src={previewVideo} />
//                                                 Your browser does not support the video tag.
//                                             </video>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* Footer Buttons */}
//                 <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
//                     <button
//                         onClick={onClose}
//                         className="btn-outline-danger px-5 py-2"
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         onClick={submitData}
//                         className="btn-primary px-5 py-2"
//                     >
//                         {initialData ? "Update" : "Create"}
//                     </button>
//                 </div>
//             </div>
//             {loading && (
//                 <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
//                     <div className="flex flex-col items-center gap-3">

//                         {/* Spinner */}
//                         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

//                         {/* Optional Text */}
//                         <p className="text-gray-700 font-medium">Processing...</p>

//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

//export default ReuseForm;



import axios from "axios";
import { useState, useEffect } from "react";
import { usePermission } from "../context/PermissionContext";

function ReuseForm({ title, fields, apiUrl, method = "post", onClose, onSuccess, initialData }) {
    const [Formdata, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [previewVideo, setPreviewVideo] = useState(null);
    const [removedImages, setRemovedImages] = useState([]);
    const [removeVideo, setRemoveVideo] = useState(false);

    const { hasPermission } = usePermission();

    const IMG_BASE = "https://res.cloudinary.com/djvwiudx2/image/upload/tasks/images/";
    const VIDEO_BASE = "https://res.cloudinary.com/djvwiudx2/video/upload/tasks/videos/";

    useEffect(() => {
        if (initialData) {
            const prefilled = {};
            fields.forEach((field) => {
                if (initialData[field.name] && typeof initialData[field.name] === "object" && !Array.isArray(initialData[field.name])) {
                    prefilled[field.name] = initialData[field.name]._id || "";
                } else {
                    prefilled[field.name] = initialData[field.name] || "";
                }
            });
            setFormData(prefilled);

            if (initialData.image) {
                const imgArr = Array.isArray(initialData.image) ? initialData.image : [initialData.image];
                setPreviewImages(imgArr.map(img => img.startsWith("blob") ? img : `${IMG_BASE}${img}`));
            }

            if (initialData.video) {
                setPreviewVideo(initialData.video.startsWith("blob") ? initialData.video : `${VIDEO_BASE}${initialData.video}`);
            }
        } else {
            const emptyData = {};
            fields.forEach((field) => (emptyData[field.name] = ""));
            setFormData(emptyData);
            setPreviewImages([]);
            setPreviewVideo(null);
        }
    }, [initialData, fields]);

    const handleChange = (e, field) => {
        if (field.type === "image") {
            const files = Array.from(e.target.files);
            setFormData({ ...Formdata, [field.name]: files });
            setPreviewImages(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
        } else if (field.type === "video") {
            const file = e.target.files[0];
            setFormData({ ...Formdata, [field.name]: file });
            setPreviewVideo(file ? URL.createObjectURL(file) : null);
            setRemoveVideo(false);
        } else {
            setFormData({ ...Formdata, [field.name]: e.target.value });
        }
    };

    const removeFile = (fieldName, index, isVideo = false) => {
        if (isVideo) {
            setPreviewVideo(null);
            setRemoveVideo(true);
            setFormData({ ...Formdata, [fieldName]: "" });
        } else {
            const removed = previewImages[index];
            if (!removed.startsWith("blob")) {
                setRemovedImages(prev => [...prev, removed]);
            }
            const updatedPreviews = previewImages.filter((_, i) => i !== index);
            setPreviewImages(updatedPreviews);
        }
    };

    const submitData = async () => {
        try {
            setLoading(true);

            const hasFileField = fields.some((field) => field.fieldType === "file");

            if (!hasFileField) {
                await axios({
                    url: apiUrl,
                    method: method,
                    data: Formdata,
                    withCredentials: true
                });
            }
            else{
            const data = new FormData();

            Object.keys(Formdata).forEach((key) => {
                const value = Formdata[key];
                if (Array.isArray(value)) {
                    value.forEach((v) => { if (v instanceof File) data.append(key, v); });
                } else if (value instanceof File) {
                    data.append(key, value);
                } else if (value !== "" && value !== null) {
                    data.append(key, value);
                }
            });

            removedImages.forEach(img => {
                const fileName = img.split("/").pop();
                data.append("removeImages", fileName);
            });

            if (removeVideo) data.append("removeVideo", "true");

            await axios({
                url: apiUrl,
                method: method,
                data: data,
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });
        }

            onSuccess();
            onClose();
        } catch (error) {
            console.log(error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[95vh] relative">

                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">{title}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {fields.map((field) => (
                        <div key={field.name} className={`flex flex-col gap-1.5 ${field.fieldType === "file" ? "md:col-span-2" : ""}`}>
                            <label className="text-sm font-bold text-gray-600 capitalize">
                                {field.label || field.name}
                            </label>

                            {/* {field.fieldType === "input" && (
                                <input
                                    type={field.type}
                                    value={Formdata[field.name] || ""}
                                    onChange={(e) => handleChange(e, field)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 outline-none transition"
                                />
                            )}

                            {field.fieldType === "select" && (
                                <select
                                    value={Formdata[field.name] || ""}
                                    onChange={(e) => setFormData({ ...Formdata, [field.name]: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 outline-none bg-white transition"
                                >
                                    <option value="">Select Option</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            )} */}
                            {field.fieldType === "input" && (
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={(Formdata[field.name] || "")}
                                    placeholder={field.placeholder}
                                    onChange={(e) => handleChange(e, field)}
                                    disabled={field.disabled}
                                    //readOnly={field.readOnly}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 
                                                     focus:ring-2 focus:ring-red-400 focus:outline-none transition-all"
                                />
                            )}

                            {/* SELECT FIELD */}
                            {field.fieldType === "select" && (
                                <select
                                    value={Formdata[field.name] || ""}
                                    onChange={(e) =>
                                        setFormData({ ...Formdata, [field.name]: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 
                                         focus:ring-2 focus:ring-red-400 focus:outline-none bg-white transition-all"

                                >
                                    <option value="">Select {field.label || field.name}</option>
                                    {field.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* MULTI SELECT */}
                            {field.fieldType === "multiselect" && (
                                <select
                                    multiple
                                    value={Formdata[field.name] || []}
                                    onChange={(e) => {
                                        const selected = Array.from(
                                            e.target.selectedOptions
                                        ).map((opt) => opt.value); setFormData({
                                            ...Formdata,
                                            [field.name]: selected,
                                        });
                                    }}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 
                                         focus:ring-2 focus:ring-red-400 focus:outline-none transition-all min-h-[100px]"                                     >
                                    {field.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {field.fieldType === "file" && (
                                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <input
                                        type="file"
                                        onChange={(e) => handleChange(e, field)}
                                        multiple={field.type === "image"}
                                        accept={field.type === "image" ? "image/*" : "video/*"}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
                                    />

                                    {/* IMAGE PREVIEW AREA - Positioned below the input */}
                                    {field.type === "image" && previewImages.length > 0 && (
                                        <div className="flex flex-wrap gap-4 mt-4">
                                            {previewImages.map((img, idx) => (
                                                <div key={idx} className="relative group w-24 h-24 shadow-sm">
                                                    <img
                                                        src={img}
                                                        className="w-20 h-20 object-cover rounded-lg border-2 border-white cursor-pointer"
                                                        alt="preview"
                                                        // Calls function to hide long Cloudinary URL
                                                        onClick={() => {
                                                            const fileName = img.split('/').pop();
                                                            fetch(img).then(res => res.blob()).then(blob => {
                                                                const blobUrl = URL.createObjectURL(blob);
                                                                window.open(blobUrl, "_blank");
                                                            });
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(field.name, idx)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* VIDEO PREVIEW AREA - Positioned below the input */}
                                    {field.type === "video" && previewVideo && (
                                        <div className="relative group w-fit mt-4">
                                            <video
                                                src={previewVideo}
                                                className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-sm cursor-pointer"
                                                onClick={() => {
                                                    fetch(previewVideo).then(res => res.blob()).then(blob => {
                                                        const blobUrl = URL.createObjectURL(blob);
                                                        window.open(blobUrl, "_blank");
                                                    });
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(field.name, null, true)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="btn-outline-danger px-5 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={submitData}
                        className="btn-primary px-5 py-2"
                    >
                        {initialData ? "Update" : "Create"}
                    </button>
                </div>
            </div>
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">

                        {/* Spinner */}
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                        {/* Optional Text */}
                        <p className="text-gray-700 font-medium">Processing...</p>

                    </div>
                </div>
            )}
        </div>
    );
}
export default ReuseForm;






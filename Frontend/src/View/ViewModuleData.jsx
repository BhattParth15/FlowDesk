import React from "react";

const ViewModal = ({ open, data, fields = [], onClose }) => {
    if (!open || !data) return null;
    // Open image/video in new tab using blob
    const openFile = (url) => {
        fetch(url)
            .then(res => res.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, "_blank");
            });
    };
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white w-full max-w-[95%] sm:max-w-[600px] lg:max-w-[750px] p-4 sm:p-6 rounded-lg shadow-lg max-h-[90vh] overflow-auto">
                <h3 className="text-lg sm:text-xl font-semibold mb-5">View Details</h3>
                {fields.map((field) => {
                    const value = data[field.key];
                    if (!value) return null;
                    // IMAGE FIELD
                    if (field.type === "image") {
                        return (
                            <div key={field.key} className="mb-4">
                                <b className="block mb-2">{field.label}:</b>
                                <div className="flex gap-2 flex-wrap">
                                    {value.map((img, i) => {
                                        const imgUrl =`https://res.cloudinary.com/djvwiudx2/image/upload/tasks/images/${img}`;
                                        return (
                                            <img
                                                key={i}
                                                src={imgUrl}
                                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover border rounded cursor-pointer hover:scale-105 transition"
                                                onClick={() => openFile(imgUrl)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }
                    // VIDEO FIELD
                    if (field.type === "video") {
                        const videoUrl =`https://res.cloudinary.com/djvwiudx2/video/upload/tasks/videos/${value}`;
                        return (
                            <div key={field.key} className="mb-4">
                                <b className="block mb-2">{field.label}:</b>
                                <div
                                    className="relative w-28 h-16 sm:w-32 sm:h-20 border rounded bg-black cursor-pointer hover:opacity-80"
                                    onClick={() => openFile(videoUrl)}
                                >
                                    <video className="w-full h-full object-cover rounded">
                                        <source src={videoUrl} type="video/mp4" />
                                    </video>
                                </div>
                            </div>
                        );
                    }
                    // OBJECT FIELD
                    if (field.type === "object") {
                        return (
                            <div key={field.key} className="mb-3 text-sm sm:text-base">
                                <b>{field.label}:</b> {value?.name || "-"}
                            </div>
                        );
                    }
                    // DATE FIELD
                    if (field.type === "date") {
                        return (
                            <div key={field.key} className="mb-3 text-[15px] sm:text-base">
                                <b>{field.label}:</b>{" "}
                                {new Date(value).toLocaleDateString()}
                            </div>
                        );
                    }
                    // DEFAULT TEXT FIELD
                    return (
                        <div key={field.key} className="mb-3 text-sm sm:text-base break-words">
                            <b>{field.label}:</b> {value}
                        </div>
                    );

                })}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-700 text-white px-4 sm:px-5 py-2 rounded hover:bg-gray-800 text-sm sm:text-base"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ViewModal;
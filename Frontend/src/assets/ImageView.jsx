import { useParams } from "react-router-dom";

const ImageViewer = () => {
    const { fileName } = useParams();
    const fullUrl = `https://res.cloudinary.com/djvwiudx2/image/upload/tasks/images/${fileName}`;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            {/* //<h2 className="text-white mb-4 text-lg">{fileName}</h2> */}
            <img 
                src={fullUrl} 
                alt={fileName} 
                className="max-w-full max-h-[80vh] shadow-2xl rounded-lg"
            />
            <button 
                onClick={() => window.close()} 
                className="mt-8 px-10 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
                Close
            </button>
        </div>
    );
};
export default ImageViewer;
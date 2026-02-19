import { useParams } from "react-router-dom";

const VideoViewer = () => {
    const { fileName } = useParams();
    const fullUrl = `https://res.cloudinary.com/djvwiudx2/video/upload/v1/tasks/videos/${fileName}`;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4">


            {/* The Video Player */}
            <div >
                <video
                    src={fullUrl}
                    controls
                    autoPlay
                    className="max-w-full max-h-[80vh] shadow-2xl rounded-lg"
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Styled Close Button */}
            <button
                onClick={() => window.close()}
                className="mt-10 px-12 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform active:scale-95"
            >
                Close
            </button>
        </div>

    );
};

export default VideoViewer;
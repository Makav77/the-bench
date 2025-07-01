interface ImageModalProps {
    imageUrl: string;
    onClose: () => void;
}

function ImageModal ({ imageUrl, onClose }: ImageModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative max-w-3xl w-full p-4">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white text-2xl cursor-pointer"
                >
                    &times
                </button>

                <img
                    src={imageUrl}
                    alt="Enlarged"
                    className="w-full h-auto rounded-lg shadow-lg"
                />
            </div>
        </div>
    );
}

export default ImageModal;

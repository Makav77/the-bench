import { GalleryItemSummary } from "../../api/galleryService";
import { Heart } from "lucide-react";
import classNames from "classnames";

interface GalleryItemProps {
    galleryItem: GalleryItemSummary;
    currentUserId?: string;
    onClick: () => void;
    onToggleLike: () => void;
}

function GalleryItemCard({ galleryItem, currentUserId, onClick, onToggleLike }: GalleryItemProps) {
    const liked = galleryItem.likedBy.some(u => u.id === currentUserId);

    return (
        <div className="relative">
            <img
                src={galleryItem.url}
                alt={galleryItem.description || "gallery picture"}
                className="w-full h-48 object-cover rounded cursor-pointer"
                onClick={onClick}
            />

            <button
                onClick={e => { e.stopPropagation(); onToggleLike(); }}
                className="absolute top-2 right-2 flex items-center space-x-1 bg-white/80 p-1 rounded"
            >
                <Heart className={classNames("w-5 h-5", liked ? "text-red-600 fill-red-600" : "text-gray-600")} />
                <span>{galleryItem.likedBy.length}</span>
            </button>
        </div>
    )
}

export default GalleryItemCard;

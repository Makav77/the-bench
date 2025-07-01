import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFlashPosts, FlashPostSummary } from "../../../api/flashPostService";
import CountdownTimer from "../../FlashPosts/CountdownTimer";

function LatestFlashPostCard() {
    const [flashPost, setFlashPost] = useState<FlashPostSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const { data } = await getFlashPosts(1, 1);
                if (data.length > 0) {
                    setFlashPost(data[0]);
                } else {
                    setError("No post available.");
                }
            } catch (error) {
                setError("Unable to load latest post: " + error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    if (isLoading) {
        return <p className="p-6">Loading...</p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>
    }

    if (!flashPost) {
        return <p className="p-6">No post available</p>
    }

    return (
        <div
            onClick={() => navigate(`/flashposts/${flashPost.id}`)}
            className="flex justify-between items-center w-3/4 mx-auto bg-white rounded-2xl shadow hover:bg-gray-100 cursor-pointer transition h-25 px-5 mb-10"
        >
            <div className="pr-4">
                <h4 className="text-lg font-bold">{flashPost.title}</h4>
                <p className="text-sm text-gray-500">
                    Last update {new Date(flashPost.updatedAt).toLocaleDateString()}
                </p>
            </div>

            <div>
                <p>Author :{" "}
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${flashPost.author.id}`);
                        }}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {flashPost.author.firstname} {flashPost.author.lastname}
                    </span>
                </p>
                <div className="text-center">
                    <CountdownTimer createdAt={flashPost.updatedAt} />
                </div>
            </div>
        </div>
    );
}

export default LatestFlashPostCard;

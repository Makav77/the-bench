import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts, PostSummary } from "../../../api/postService";
import { useTranslation } from "react-i18next";

function LatestPostCard() {
    const [post, setPost] = useState<PostSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation("Homepage/LatestPostCard");

    useEffect(() => {
        async function load() {
            try {
                const { data } = await getPosts(1, 1);
                if (data.length > 0) {
                    setPost(data[0]);
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
        return <p className="p-6">{t("loading")}</p>;
    }

    if (error) {
        return <p className="p-6 text-red-500">{error}</p>
    }

    if (!post) {
        return <p className="p-6">{t("noPostAvailable")}</p>
    }

    return (
        <div
            onClick={() => navigate(`/posts/${post.id}`)}
            className="flex justify-between items-center w-3/4 mx-auto bg-white rounded-2xl shadow hover:bg-gray-100 cursor-pointer transition h-25 px-5 mb-10"
        >
            <div className="pr-4">
                <h4 className="text-lg font-bold">{post.title}</h4>
                <p className="text-sm text-gray-500">
                    {t("lastUpdate")} {new Date(post.updatedAt).toLocaleDateString()}
                </p>
            </div>

            <div>
                <p>{t("author")}{" "}
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${post.author.id}`);
                        }}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {post.author.firstname} {post.author.lastname}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default LatestPostCard;

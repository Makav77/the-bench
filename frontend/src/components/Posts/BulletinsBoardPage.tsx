import { useState, useEffect } from "react";
import { getPosts, PostSummary } from "../../api/postService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function BulletinsBoardPage() {
    const [posts, setPosts] = useState<PostSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const { data, lastPage } = await getPosts(page, 10);
                setPosts(data);
                setLastPage(lastPage);
            } catch (error) {
                console.error(error);
                toast.error("Unable to load posts : " + error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page]);

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">
                Bulletins Board
            </h1>

            <div className="text-right">
                <button
                    type="button"
                    onClick={() => navigate("/posts/create")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Create Post
                </button>
            </div>

            {loading && <p>Loading...</p>}

            {posts.map((p) => {
                const cardClass = user?.role === "admin" ? "border-green-500 bg-green-500" : "border-gray-300";
                return (
                    <div
                        key={p.id}
                        onClick={() => navigate(`/posts/${p.id}`)}
                        className={`p-4 border ${cardClass} rounded cursor-pointer hover:shadow`}
                    >
                        <h2 className="font-semibold">{p.title}</h2>
                        <p className="text-sm text-gray-600">
                            Last update at {new Date(p.updatedAt).toLocaleString()} by {" "} {p.author.firstname} {p.author.lastname}
                        </p>
                    </div>
                );
            })}

            <div className="flex justify-center items-center space-x-4 mt-6">
                <button
                    type="button"
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    ← Prev
                </button>

                <span>
                    Page {page} / {lastPage}
                </span>

                <button
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

export default BulletinsBoardPage;

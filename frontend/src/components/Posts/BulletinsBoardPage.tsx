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
        <div className="p-6 w-[30%] mx-auto">
            <div className="flex justify-end mb-4 h-10">
                <button
                    type="button"
                    onClick={() => navigate("/posts/create")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                >
                    Create Post
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Bulletins Board</h1>

            {loading && <p>Loading...</p>}

            <div className="grid grid-cols-1 gap-4">
                {posts.map((p) => {
                    const cardClass = p.author.role === "admin" ? "border bg-green-400" : "border";
                    return (
                        <div
                            key={p.id}
                            onClick={() => navigate(`/posts/${p.id}`)}
                            className={`p-4 border ${cardClass} rounded cursor-pointer hover:shadow flex justify-between items-center`}
                        >
                            <div className="flex flex-col">
                                <h2 className="text-lg font-semibold">{p.title}</h2>
                                <p className="text-sm text-gray-600">
                                    Last update at {new Date(p.updatedAt).toLocaleString()} by {" "} {p.author.firstname} {p.author.lastname}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center items-center mt-6 gap-4">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    ← Prev
                </button>

                <span>
                    Page {page} / {lastPage}
                </span>

                <button
                    type="button"
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

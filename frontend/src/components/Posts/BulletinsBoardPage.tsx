import { useState, useEffect } from "react";
import { getPosts, PostSummary } from "../../api/postService";
import { getFlashPosts, FlashPostSummary } from "../../api/flashPostService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CountdownTimer from "../FlashPosts/CountdownTimer";

function BulletinsBoardPage() {
    const [posts, setPosts] = useState<PostSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [flashPosts, setFlashPosts] = useState<FlashPostSummary[]>([]);
    const [flashPage, setFlashPage]     = useState(1);
    const [flashLastPage, setFlashLastPage] = useState(1);
    const [flashLoading, setFlashLoading]   = useState(false);

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

    useEffect(() => {
        const loadFlash = async () => {
            setFlashLoading(true);

            try {
                const { data, lastPage } = await getFlashPosts(flashPage, 5);
                setFlashPosts(data);
                setFlashLastPage(lastPage);
            } catch (error) {
                console.error(error);
                toast.error("Unable to load flash posts : " + error);
            } finally {
                setFlashLoading(false);
            }
        };
        loadFlash();
    }, [flashPage]);

    return (
        <div className="p-6 w-[30%] mx-auto">
            <div className="flex justify-end mb-4 h-10 gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/posts/create")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                >
                    Create Post
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/flashposts/create")}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                >
                    Create Flash Post
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Bulletins Board</h1>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Flash Posts (24h)</h2>

                    {flashLoading
                        ? <p>Loading flash posts...</p>
                        : flashPosts.length === 0
                            ? <p className="italic text-gray-500">No flash posts right now.</p>
                            : (
                                <div className="grid grid-cols-1 gap-4 border p-4 mb-4">
                                    {flashPosts.map((flashpost) => {
                                        const cardClass = flashpost.author.role === "admin" ? "border bg-green-400" : "border";
                                        return (
                                            <div
                                                key={flashpost.id}
                                                onClick={() => navigate(`/flashposts/${flashpost.id}`)}
                                                className={`p-4 border ${cardClass} rounded cursor-pointer hover:shadow flex justify-between items-center`}
                                            >
                                                <div className="flex flex-col w-full">
                                                    <h2 className="text-lg font-semibold">{flashpost.title}</h2>
                                                    <div className="flex justify-between">
                                                        <p className="text-sm text-gray-600">
                                                            Last update at {new Date(flashpost.updatedAt).toLocaleString()}
                                                        </p>
                                                        <CountdownTimer createdAt={flashpost.updatedAt} />
                                                    </div>
                                                    <p className="text-sm text-gray-600">Author : {flashpost.author.firstname} {flashpost.author.lastname}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                    }

                <div className="flex justify-center items-center gap-4">
                    <button
                        disabled={flashPage <= 1}
                        onClick={() => setFlashPage(p => p - 1)}
                        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        ← Prev
                    </button>

                    <span>Page {flashPage} / {flashLastPage}</span>

                    <button
                        disabled={flashPage >= flashLastPage}
                        onClick={() => setFlashPage(p => p + 1)}
                        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next →
                    </button>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Posts</h2>

                {loading
                    ? <p>Loading posts...</p>
                    : posts.length === 0
                        ? <p className="italic text-gray-500">No posts right now.</p>
                        : (
                            <div className="grid grid-cols-1 gap-4 border p-4 mb-4">
                                {posts.map((post) => {
                                    const cardClass = post.author.role === "admin" ? "border bg-green-400" : "border";
                                    return (
                                        <div
                                            key={post.id}
                                            onClick={() => navigate(`/posts/${post.id}`)}
                                            className={`p-4 border ${cardClass} rounded cursor-pointer hover:shadow flex justify-between items-center`}
                                        >
                                            <div className="flex flex-col">
                                                <h2 className="text-lg font-semibold">{post.title}</h2>
                                                <p className="text-sm text-gray-600">
                                                    Last update at {new Date(post.updatedAt).toLocaleString()} by {" "} {post.author.firstname} {post.author.lastname}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                }

                <div className="flex justify-center items-center mt-6 gap-4">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        ← Prev
                    </button>

                    <span>Page {page} / {lastPage}</span>

                    <button
                        type="button"
                        disabled={page >= lastPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next →
                    </button>
                </div>
            </section>
        </div>
    );
}

export default BulletinsBoardPage;

import { useState, useEffect } from "react";
import { getPosts, PostSummary } from "../../api/postService";
import { getFlashPosts, FlashPostSummary } from "../../api/flashPostService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CountdownTimer from "../FlashPosts/CountdownTimer";
import { useTranslation } from "react-i18next";

function BulletinsBoardPage() {
    const [posts, setPosts] = useState<PostSummary[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation("Posts/BulletinsBoard");
    const [flashPosts, setFlashPosts] = useState<FlashPostSummary[]>([]);
    const [flashPage, setFlashPage] = useState(1);
    const [flashLastPage, setFlashLastPage] = useState(1);
    const [flashLoading, setFlashLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const { data, lastPage } = await getPosts(page, 10);
                setPosts(data);
                setLastPage(lastPage);
            } catch {
                toast.error(t("toastLoadPostError"));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, t]);

    useEffect(() => {
        const loadFlash = async () => {
            setFlashLoading(true);

            try {
                const { data, lastPage } = await getFlashPosts(flashPage, 5);
                setFlashPosts(data);
                setFlashLastPage(lastPage);
            } catch {
                toast.error(t("toastLoadFlashPostError"));
            } finally {
                setFlashLoading(false);
            }
        };
        loadFlash();
    }, [flashPage, t]);

    return (
        <div className="p-6 w-[30%] mx-auto max-sm:w-full max-sm:p-6">
            <div className="flex justify-end max-sm:justify-between mb-4 h-10 max-sm:h-15 gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/posts/create")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                >
                    {t("createPost")}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/flashposts/create")}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded w-fit cursor-pointer"
                >
                    {t("createFlashPost")}
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-4">{t("bulletinsBoard")}</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-2 max-sm:text-xl">{t("flashPost")}</h2>

                {flashLoading
                    ? <p className="max-sm:text-lg">{t("loading")}</p>
                    : flashPosts.length === 0
                        ? <p className="italic text-red-500 mb-5 max-sm:text-lg">{t("noFlashPost")}</p>
                        : (
                            <div className="grid grid-cols-1 gap-4 border p-4 mb-4 rounded-2xl max-sm:p-2">
                                {flashPosts.map((flashpost) => (
                                    <div
                                        key={flashpost.id}
                                        onClick={() => navigate(`/flashposts/${flashpost.id}`)}
                                        className="p-4 rounded-2xl cursor-pointer hover:shadow flex justify-between items-center bg-white hover:bg-gray-100 max-sm:p-3"
                                    >
                                        <div className="flex flex-col w-full">
                                            <h2 className="text-lg font-semibold max-sm:text-lg">{flashpost.title}</h2>
                                            <div className="flex justify-between max-sm:flex-col max-sm:gap-2">
                                                <p className="text-sm text-gray-600 max-sm:text-base">
                                                    {t("lastUpdate")} {new Date(flashpost.updatedAt).toLocaleString()}
                                                </p>
                                                <CountdownTimer createdAt={flashpost.createdAt} />
                                            </div>
                                            <p className="text-sm text-gray-600 max-sm:text-base">
                                                {t("author")}{" "}
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/profile/${flashpost.author.id}`);
                                                    }}
                                                    className="text-blue-600 hover:underline cursor-pointer"
                                                >
                                                    {flashpost.author.firstname} {flashpost.author.lastname}
                                                </span>
                                                {(flashpost.author.role === "admin" || flashpost.author.role === "moderator") && (
                                                    <span className="ml-1 font-semibold text-red-600">
                                                        ({flashpost.author.role})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                }

                <div className="flex justify-center items-center gap-4 max-sm:gap-2">
                    <button
                        disabled={flashPage <= 1}
                        onClick={() => setFlashPage(p => p - 1)}
                        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:px-4 max-sm:py-3 max-sm:text-lg"
                    >
                        {t("previous")}
                    </button>

                    <span className="max-sm:text-lg">{t("page")} {flashPage} / {flashLastPage}</span>

                    <button
                        disabled={flashPage >= flashLastPage}
                        onClick={() => setFlashPage(p => p + 1)}
                        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:px-4 max-sm:py-3 max-sm:text-lg"
                    >
                        {t("next")}
                    </button>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-2 max-sm:text-xl">{t("posts")}</h2>

                {loading
                    ? <p className="max-sm:text-lg">{t("loading")}</p>
                    : posts.length === 0
                        ? <p className="italic text-gray-500 max-sm:text-lg">{t("noPost")}</p>
                        : (
                            <div className="grid grid-cols-1 gap-4 border p-4 mb-4 rounded-2xl max-sm:p-2">
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        onClick={() => navigate(`/posts/${post.id}`)}
                                        className="p-4 rounded-2xl cursor-pointer hover:shadow flex justify-between items-center bg-white hover:bg-gray-100 max-sm:p-3"
                                    >
                                        <div className="flex flex-col">
                                            <h2 className="text-lg font-semibold max-sm:text-lg">{post.title}</h2>
                                            <p className="text-sm text-gray-600 max-sm:text-base">
                                                {t("lastUpdate")} {new Date(post.updatedAt).toLocaleString()}
                                                <p className="text-sm text-gray-600 max-sm:text-base">{t("author")} {" "}
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/profile/${post.author.id}`);
                                                        }}
                                                        className="text-blue-600 hover:underline cursor-pointer"
                                                    >
                                                        {post.author.firstname} {post.author.lastname}
                                                    </span>
                                                    {(post.author.role === "admin" || post.author.role === "moderator") && (
                                                        <span className="ml-1 font-semibold text-red-600">
                                                            ({post.author.role})
                                                        </span>
                                                    )}
                                                </p>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                }

                <div className="flex justify-center items-center mt-6 gap-4 max-sm:gap-2">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:px-4 max-sm:py-3 max-sm:text-lg"
                    >
                        {t("previous")}
                    </button>

                    <span className="max-sm:text-lg">{t("page")} {page} / {lastPage}</span>

                    <button
                        type="button"
                        disabled={page >= lastPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer max-sm:px-4 max-sm:py-3 max-sm:text-lg"
                    >
                        {t("next")}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default BulletinsBoardPage;

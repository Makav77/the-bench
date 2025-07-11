import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NewsForm from "./NewsForm";
import { getOneNews, updateNews, uploadNewsImages } from "../../../api/newsService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function EditNews() {
    const { id } = useParams<{ id: string }>();
    const [defaults, setDefaults] = useState<{ title: string; content: string; tags: string[]; images: string[] }>();
    const navigate = useNavigate();
    const { t } = useTranslation("Community/EditNewsForm");

    useEffect(() => {
        const load = async () => {
            if (id) {
                const news = await getOneNews(id);
                setDefaults({
                    title: news.title,
                    content: news.content,
                    tags: news.tags || [],
                    images: news.images || [],
                });
            }
        };
        load();
    }, [id]);

    const handleSubmit = async (data: { title: string; content: string; tags: string[]; images: File[]; removeImages?: string[] }) => {
        if (!id) {
            return;
        };

        let newImages: string[] = [];
        if (data.images.length) {
            newImages = await uploadNewsImages(data.images);
        }
        const keptImages = defaults?.images.filter((img) => !data.removeImages?.includes(img)) ?? [];
        const allImages = [...keptImages, ...newImages];

        const updated = await updateNews(id, {
            title: data.title,
            content: data.content,
            images: allImages,
            tags: data.tags,
        });
        toast.success(t("toastArticleUpdated"));
        navigate(`/news/${updated.id}`);
    };

    if (!defaults) {
        return <p>
            {t("loading")}
        </p>;
    }

    return (
        <div className="p-6">
            <h1 className="max-w-xl mx-auto text-4xl font-semibold mb-4">
                {t("editArticle")}
            </h1>

            <NewsForm 
                defaultValues={defaults}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

export default EditNews;

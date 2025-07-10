import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostForm from "./PostForm";
import { getPost, updatePost } from "../../api/postService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function EditPostPage() {
    const { id } = useParams<{ id: string }>();
    const [defaults, setDefaults] = useState<{ title: string; description: string; }>();
    const navigate = useNavigate();
    const { t } = useTranslation("Posts/EditPostPage");

    useEffect(() => {
        const fetch = async () => {
            if (id) {
                const defaults = await getPost(id);
                setDefaults(defaults);
            }
        };
        fetch();
    }, [id]);

    const handleSubmit = async (data: { title: string; description: string; }) => {
        if (!id) {
            return;
        }

        const updated = await updatePost(id!, data);
        toast.success(t("toastPostUpdated"));
        navigate(`/posts/${updated.id}`);
    };

    if (!defaults) {
        return <p>{t("loading")}</p>
    };

    return (
        <div className="p-6">
            <h1 className="max-w-xl mx-auto text-4xl font-semibold mb-4">
                {t("editPost")}
            </h1>

            <PostForm
                defaultValues={defaults}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

export default EditPostPage;

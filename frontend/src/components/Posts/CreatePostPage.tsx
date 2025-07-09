import { useNavigate } from "react-router-dom";
import PostForm from "./PostForm";
import { createPost } from "../../api/postService";
import { toast } from "react-toastify";
import usePermission from "../Utils/usePermission";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

function CreatePostPage() {
    const navigate = useNavigate();
    const { t } = useTranslation("Posts/CreatePostPage");
    const { restricted, expiresAt, reason } = usePermission("publish_post");

    if (restricted === null) {
        return <p className="p-6 text-center">{t("checkingPermissions")}</p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    {t("restrictionMessage")} {" "}
                    {expiresAt
                        ? format(new Date(expiresAt), "dd/MM/yyyy 'at' HH:mm")
                        : "unknown date"}.
                    <br />
                    {reason && (
                        <span>
                            {t("reason")} {reason}
                            <br />
                        </span>
                    )}
                    {t("contactMessage")}
                </p>
            </div>
        );
    }

    const handleSubmit = async (data: { title: string; description: string; }) => {
        const post = await createPost(data);
        toast.success(t("toastPostCreated"));
        navigate(`/posts/${post.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="max-w-xl mx-auto text-4xl font-semibold mb-4">{t("createPost")}</h1>
            <PostForm onSubmit={handleSubmit} />
        </div>
    );
}

export default CreatePostPage;

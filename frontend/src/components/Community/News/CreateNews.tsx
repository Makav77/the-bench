import { useNavigate } from "react-router-dom";
import NewsForm from "./NewsForm";
import { createNews, uploadNewsImages } from "../../../api/newsService";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

function CreateNews() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation("Community/CreateNews");

    const { restricted, expiresAt, reason } = usePermission("create_news");
    if (restricted === null) {
        return <p className="p-6 text-center">{t("checkingPermissions")}</p>
    }
    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    {t("restrictionMessage")} {" "}
                    {expiresAt
                        ? format(expiresAt, "dd/MM/yyyy 'at' HH:mm")
                        : "unknow date"}.
                    {reason && (
                        <span>
                            <br />
                        {t("reason")} {reason}
                        <br />
                        </span>
                    )}
                    {t("contactMessage")}
                </p>
            </div>
        );
    }

    const handleSubmit = async (data: { title: string; content: string; tags: string[]; images: File[] }) => {
        if (!user) {
            return;
        }
        let imagesUrls: string[] = [];
        if (data.images.length) {
            imagesUrls = await uploadNewsImages(data.images);
        }
        await createNews({
            title: data.title,
            content: data.content,
            images: imagesUrls,
            tags: data.tags,
            authorId: user.id,
        });
        toast.success(t("toastArticleSent"));
        navigate("/news");
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-semibold mb-4 w-[30%] mx-auto">{t("createNews")}</h1>
            <NewsForm 
                onSubmit={handleSubmit}
            />
        </div>
    );
}

export default CreateNews;

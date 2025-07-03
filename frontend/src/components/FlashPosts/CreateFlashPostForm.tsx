import { useNavigate } from "react-router-dom";
import FlashPostForm from "./FlashPostForm";
import { createFlashPost } from "../../api/flashPostService";
import { toast } from "react-toastify";
import usePermission from "../Utils/usePermission";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

function CreateFlashPostForm() {
    const navigate = useNavigate();
    const { t } = useTranslation("FlashPosts/CreateFlashPostForm");

    const { restricted, expiresAt, reason } = usePermission("publish_flash_post");
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
        const flashPost = await createFlashPost(data);
        toast.success("Flash Post created !");
        navigate(`/flashposts/${flashPost.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="w-[28%] mx-auto text-4xl font-semibold mb-4 pl-2">{t("createFlashpost")}</h1>
            <FlashPostForm onSubmit={handleSubmit} />
        </div>
    );
}

export default CreateFlashPostForm;

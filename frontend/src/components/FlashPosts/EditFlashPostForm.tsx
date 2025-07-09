import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FlashPostForm from "./FlashPostForm";
import { getFlashPost, updateFlashPost } from "../../api/flashPostService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function EditFlashPostForm() {
    const { id } = useParams<{ id: string }>();
    const [defaults, setDefaults] = useState<{ title: string; description: string; }>();
    const navigate = useNavigate();
    const { t } = useTranslation("FlashPosts/EditFlashPostForm");

    useEffect(() => {
        const fetch = async () => {
            if (id) {
                const defaults = await getFlashPost(id);
                setDefaults(defaults);
            }
        };
        fetch();
    }, [id]);

    const handleSubmit = async (data: { title: string; description: string; }) => {
        if (!id) {
            return;
        }

        const updated = await updateFlashPost(id!, data);
        toast.success(t("toastFlashpostUpdated"));
        navigate(`/flashposts/${updated.id}`);
    }

    if (!defaults) {
        return <p>
            {t("loading")}
        </p>
    };

    return (
        <div className="p-6">
            <h1 className="w-[28%] mx-auto text-4xl font-semibold mb-4 pl-2 max-sm:w-full">
                {t("editFlashpost")}
            </h1>

            <FlashPostForm
                defaultValues={defaults}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

export default EditFlashPostForm;

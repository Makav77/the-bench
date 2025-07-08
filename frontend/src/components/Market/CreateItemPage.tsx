import { useNavigate } from "react-router-dom";
import ItemForm, { ItemFormData } from "./ItemForm";
import { createItem } from "../../api/marketService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function CreateItemPage() {
    const navigate = useNavigate();
    const { t } = useTranslation("Market/CreateItemPage");

    const handleSubmit = async (data: ItemFormData) => {
        const item = await createItem(data);
        toast.success(t("toastItemCreated"));
        navigate(`/market/${item.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="w-[40%] mx-auto text-4xl font-semibold mb-4 pl-2">{t("sellItem")}</h1>
            <ItemForm onSubmit={handleSubmit} />
        </div>
    );
}

export default CreateItemPage;
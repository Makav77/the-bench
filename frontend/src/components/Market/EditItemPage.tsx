import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ItemForm, { ItemFormData } from "./ItemForm";
import { getItem, updateItem } from "../../api/marketService";
import { MarketItemDetails } from "../../api/marketService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function EditItemPage() {
    const navigate = useNavigate();
    const { t } = useTranslation("Market/EditItemPage")
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<MarketItemDetails | null>(null);

    useEffect(() => {
        const fetch = async () => {
            if (id) {
                const item = await getItem(id);
                setItem(item);
            }
        };
        fetch();
    }, [id]);

    const handleSubmit = async (data: ItemFormData) => {
        if (!id) {
            return;
        }
        const updated = await updateItem(id, data);
        toast.success(t("toastItemUpdated"));
        navigate(`/market/${updated.id}`);
    }

    if (!item) {
        return <p>{t("loading")}</p>
    }

    return (
        <div className="p-6">
            <h1 className="max-w-xl mx-auto text-4xl font-semibold mb-4 max-sm:w-full">
                {t("editItem")}
            </h1>

            <ItemForm
                defaultValues={item} 
                onSubmit={handleSubmit}
            />
        </div>
    );
}

export default EditItemPage;

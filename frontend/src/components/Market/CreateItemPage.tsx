import { useNavigate } from "react-router-dom";
import ItemForm, { ItemFormData } from "./ItemForm";
import { createItem } from "../../api/marketService";
import { toast } from "react-toastify";

function CreateItemPage() {
    const navigate = useNavigate();

    const handleSubmit = async (data: ItemFormData) => {
        const item = await createItem(data);
        toast.success("Item created !");
        navigate(`/market/${item.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="w-[40%] mx-auto text-4xl font-semibold mb-4 pl-2">Sell item</h1>
            <ItemForm onSubmit={handleSubmit} />
        </div>
    );
}
export default CreateItemPage;

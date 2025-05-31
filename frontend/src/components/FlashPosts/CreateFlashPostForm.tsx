import { useNavigate } from "react-router-dom";
import FlashPostForm from "./FlashPostForm";
import { createFlashPost } from "../../api/flashPostService";
import { toast } from "react-toastify";
import usePermission from "../Utils/usePermission";
import { format } from "date-fns";

function CreateFlashPostForm() {
    const navigate = useNavigate();

    const { restricted, expiresAt } = usePermission("publish_flash_post");
    if (restricted === null) {
        return <p className="p-6 text-center">Checking permissions ...</p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    You are no longer allowed to post flash ads until{" "}
                    {expiresAt
                        ? format(expiresAt, "dd/MM/yyyy 'à' HH:mm")
                        : "unknow date"}.
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
            <h1 className="w-[28%] mx-auto text-4xl font-semibold mb-4 pl-2">Create a Flash Post</h1>
            <FlashPostForm onSubmit={handleSubmit} />
        </div>
    );
}

export default CreateFlashPostForm;

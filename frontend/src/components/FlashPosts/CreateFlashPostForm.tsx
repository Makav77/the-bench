import { useNavigate } from "react-router-dom";
import FlashPostForm from "./FlashPostForm";
import { createFlashPost } from "../../api/flashPostService";
import { toast } from "react-toastify";

function CreateFlashPostForm() {
    const navigate = useNavigate();

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

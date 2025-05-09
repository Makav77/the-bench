import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FlashPostForm from "./FlashPostForm";
import { getFlashPost, updateFlashPost } from "../../api/flashPostService";
import { toast } from "react-toastify";

function EditFlashPostPage() {
    const { id } = useParams<{ id: string }>();
    const [defaults, setDefaults] = useState<{ title: string; description: string; }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async() => {
            if (id) {
                const defaults = await getFlashPost(id);
                setDefaults(defaults);
            }
        };
        fetch();
    }, [id]);

    const handleSubmit = async(data: { title: string; description: string; }) => {
        if (!id) return;
        const updated = await updateFlashPost(id!, data);
        toast.success("Flash Post updated !");
        navigate(`/flashposts/${updated.id}`);
    }

    if (!defaults) {
        return <p>Loading...</p>
    };

    return (
        <div className="p-6">
            <h1 className="w-[28%] mx-auto text-4xl font-semibold mb-4 pl-2">Edit Flash Post</h1>
            <FlashPostForm defaultValues={defaults} onSubmit={handleSubmit} />
        </div>
    );
}

export default EditFlashPostPage;

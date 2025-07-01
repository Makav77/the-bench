import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostForm from "./PostForm";
import { getPost, updatePost } from "../../api/postService";
import { toast } from "react-toastify";

function EditPostPage() {
    const { id } = useParams<{ id: string }>();
    const [defaults, setDefaults] = useState<{ title: string; description: string; }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            if (id) {
                const defaults = await getPost(id);
                setDefaults(defaults);
            }
        };
        fetch();
    }, [id]);

    const handleSubmit = async (data: { title: string; description: string; }) => {
        if (!id) return;
        const updated = await updatePost(id!, data);
        toast.success("Post updated !");
        navigate(`/posts/${updated.id}`);
    };

    if (!defaults) {
        return <p>Loading...</p>
    };

    return (
        <div className="p-6">
            <h1 className="w-[28%] mx-auto text-4xl font-semibold mb-4 pl-2">Edit Post</h1>
            <PostForm defaultValues={defaults} onSubmit={handleSubmit} />
        </div>
    );
}

export default EditPostPage;

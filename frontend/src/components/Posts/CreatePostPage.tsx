import { useNavigate } from "react-router-dom";
import PostForm from "./PostForm";
import { createPost } from "../../api/postService";
import { toast } from "react-toastify";

function CreatePostPage() {
    const navigate = useNavigate();

    const handleSubmit = async (data: { title: string; description: string; }) => {
        const post = await createPost(data);
        toast.success("Post created !");
        navigate(`/posts/${post.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="w-[28%] mx-auto text-4xl font-semibold mb-4 pl-2">Create a Post</h1>
            <PostForm onSubmit={handleSubmit} />
        </div>
    );
}

export default CreatePostPage;

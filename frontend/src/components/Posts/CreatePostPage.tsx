import { useNavigate } from "react-router-dom";
import PostForm from "./PostForm";
import { createPost } from "../../api/postService";
import { toast } from "react-toastify";
import usePermission from "../Utils/usePermission";
import { format } from "date-fns";

function CreatePostPage() {
    const navigate = useNavigate();

    const { restricted, expiresAt } = usePermission("publish_post");
    if (restricted === null) {
        return <p className="p-6 text-center">Checking permissions ...</p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    You are no longer allowed to post a post until{" "}
                    {expiresAt
                        ? format(expiresAt, "dd/MM/yyyy 'à' HH:mm")
                        : "unknow date"}.
                </p>
            </div>
        );
    }

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

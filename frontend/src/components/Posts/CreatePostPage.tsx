import { useNavigate } from "react-router-dom";
import PostForm from "./PostForm";
import { createPost } from "../../api/postService";
import { toast } from "react-toastify";
import usePermission from "../Utils/usePermission";
import { format } from "date-fns";

function CreatePostPage() {
    const navigate = useNavigate();

    const { restricted, expiresAt, reason } = usePermission("publish_post");

    if (restricted === null) {
        return <p className="p-6 text-center">Checking permissions ...</p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    You are no longer allowed to publish a post until{" "}
                    {expiresAt
                        ? format(new Date(expiresAt), "dd/MM/yyyy 'at' HH:mm")
                        : "unknown date"}.
                    <br />
                    {reason && (
                        <span>
                            Reason: {reason}
                            <br />
                        </span>
                    )}
                    Contact a moderator or administrator for more information.
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

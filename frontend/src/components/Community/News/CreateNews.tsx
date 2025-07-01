import { useNavigate } from "react-router-dom";
import NewsForm from "./NewsForm";
import { createNews, uploadNewsImages } from "../../../api/newsService";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";

function CreateNews() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const { restricted, expiresAt, reason } = usePermission("create_news");
    if (restricted === null) {
        return <p className="p-6 text-center">Checking permissions ...</p>
    }
    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    You are no longer allowed to create a news until{" "}
                    {expiresAt
                        ? format(expiresAt, "dd/MM/yyyy 'at' HH:mm")
                        : "unknow date"}.
                    {reason && (
                        <span>
                            <br />
                        Reason: {reason}
                        <br />
                        </span>
                    )}
                    Contact a moderator or administrator for more information.
                </p>
            </div>
        );
    }

    const handleSubmit = async (data: { title: string; content: string; tags: string[]; images: File[] }) => {
        if (!user) {
            return;
        }
        let imagesUrls: string[] = [];
        if (data.images.length) {
            imagesUrls = await uploadNewsImages(data.images);
        }
        await createNews({
            title: data.title,
            content: data.content,
            images: imagesUrls,
            tags: data.tags,
            authorId: user.id,
        });
        toast.success("Article sent, waiting validation.");
        navigate("/news");
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-semibold mb-4 w-[30%] mx-auto">Create news</h1>
            <NewsForm 
                onSubmit={handleSubmit} 
                buttonLabel="Create article"
            />
        </div>
    );
}

export default CreateNews;

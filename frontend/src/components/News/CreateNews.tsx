import { useNavigate } from "react-router-dom";
import NewsForm from "../../components/News/NewsForm";
import { createNews, uploadNewsImages } from "../../api/newsService";
import { toast } from "react-toastify";

function CreateNews() {
    const navigate = useNavigate();

    const handleSubmit = async (data: { title: string; content: string; tags: string[]; images: File[] }) => {
        let imagesUrls: string[] = [];
        if (data.images.length) {
            imagesUrls = await uploadNewsImages(data.images);
        }
        const news = await createNews({
            title: data.title,
            content: data.content,
            images: imagesUrls,
            tags: data.tags,
        });
        toast.success("Article published");
        navigate(`/news/${news.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-semibold mb-4 pl-2">Créer un article</h1>
            <NewsForm 
                onSubmit={handleSubmit} 
                buttonLabel="Create article"
            />
        </div>
    );
}

export default CreateNews;

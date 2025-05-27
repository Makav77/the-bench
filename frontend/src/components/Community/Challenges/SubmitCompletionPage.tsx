import { useState } from "react";
import { submitCompletion } from "../../../api/challengeService";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function SubmitCompletionPage() {
    const { id } = useParams<{ id: string }>();
    const [text, setText] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!id) {
            return;
        }

        try {
            await submitCompletion(id, { text, imageUrl });
            toast.success("Successful submit");
            navigate(`/challenges/${id}`);
        } catch (error) {
            toast.error("Error during submission : " + error);
        }
    };

    return (
        <div className="p-6 w-[50%] mx-auto">
            <h1 className="text-2xl font-bold mb-4">Validate challenge</h1>
            <textarea
                rows={4}
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-4"
            />
            <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-4"
            />
            <div className="flex justify-between">
                <button 
                    onClick={() => navigate(-1)}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                    Cancel
                </button>
                
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default SubmitCompletionPage;

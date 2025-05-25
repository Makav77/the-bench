import { useState, FormEvent } from "react";
import { createChallenge } from "../../api/challengeService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function CreateChallengePage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [successCriteria, setSuccessCriteria] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await createChallenge({ title, description, startDate, endDate, successCriteria });
            toast.success("Challenge created !");
            navigate("/challenges");
        } catch (error) {
            toast.error("Unable to create challenge : " + error);
        }
    };

    return (
        <div className="p-6 w-[50%] mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create a challenge</h1>
            <form 
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-4 rounded shadow"
            >
                <div>
                    <label className="font-semibold">Titre</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>

                <div>
                    <label className="font-semibold">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-semibold">Start date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">End date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>
                </div>

                <div>
                    <label className="font-semibold">Success criteria</label>
                    <input
                        value={successCriteria}
                        onChange={e => setSuccessCriteria(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>

                <div className="flex justify-between">
                    <button
                        type="button"
                        className="bg-gray-400 text-white px-4 py-2 rounded"
                        onClick={() => navigate('/challenges')}
                    >
                        Cancel
                    </button>
                    
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateChallengePage;

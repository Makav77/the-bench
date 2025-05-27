import { useNavigate } from "react-router-dom";
import ChallengeForm, { ChallengeFormData } from "./ChallengeForm";
import { createChallenge } from "../../../api/challengeService";
import { toast } from "react-toastify";

function CreateChallengePage() {
    const navigate = useNavigate();

    const handleSubmit = async (data: ChallengeFormData) => {
        const challenge = await createChallenge(data);
        toast.success("Défi créé !");
        navigate(`/challenges/${challenge.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="text-4xl font-semibold mb-4">Create a challenge</h1>
            <ChallengeForm onSubmit={handleSubmit} />
        </div>
    );
}

export default CreateChallengePage;

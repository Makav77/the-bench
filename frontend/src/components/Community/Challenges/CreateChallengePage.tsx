import { useNavigate } from "react-router-dom";
import ChallengeForm, { ChallengeFormData } from "./ChallengeForm";
import { createChallenge } from "../../../api/challengeService";
import { toast } from "react-toastify";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";


function CreateChallengePage() {
    const navigate = useNavigate();

        const { restricted, expiresAt } = usePermission("create_challenge");
        if (restricted === null) {
            return <p className="p-6 text-center">Checking permissions ...</p>;
        }
    
        if (restricted) {
            return (
                <div className="p-6 text-center">
                    <p className="text-red-500">
                        You are no longer allowed to create a challenge until{" "}
                        {expiresAt
                            ? format(expiresAt, "dd/MM/yyyy 'à' HH:mm")
                            : "unknow date"}.
                    </p>
                </div>
            );
        }

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

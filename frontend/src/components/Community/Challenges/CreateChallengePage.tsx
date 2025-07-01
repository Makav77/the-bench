import { useNavigate } from "react-router-dom";
import ChallengeForm, { ChallengeFormData } from "./ChallengeForm";
import { createChallenge } from "../../../api/challengeService";
import { toast } from "react-toastify";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";

function CreateChallengePage() {
    const navigate = useNavigate();

    const { restricted, expiresAt, reason } = usePermission("create_challenge");
    if (restricted === null) {
        return <p className="p-6 text-center">Checking permissions ...</p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    You are no longer allowed to create a challenge until{" "}
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

    const handleSubmit = async (data: ChallengeFormData) => {
        try {
            await createChallenge(data);
            toast.success("Challenge sent, awaiting validation.");
            navigate("/challenges");
        } catch (error) {
            console.error("Unable to send challenge : " + error);
            toast.error("Unable to send challenge.");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-4xl font-semibold mb-4">Create a challenge</h1>
            <ChallengeForm onSubmit={handleSubmit} />
        </div>
    );
}

export default CreateChallengePage;

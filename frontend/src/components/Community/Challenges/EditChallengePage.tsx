import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChallengeForm, { ChallengeFormData } from "./ChallengeForm";
import { getChallenge, updateChallenge } from "../../../api/challengeService";
import { ChallengeSummary } from "../../../api/challengeService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function EditChallengePage() {
    const navigate = useNavigate();
    const { t } = useTranslation("Community/EditChallengePage");
    const { id } = useParams<{ id: string }>();
    const [challenge, setChallenge] = useState<ChallengeSummary | null>(null);

    useEffect(() => {
        (async () => {
            if (id) {
                const data = await getChallenge(id);
                setChallenge(data);
            }
        })();
    }, [id]);

    const handleSubmit = async (data: ChallengeFormData) => {
        if (!id) {
            return;
        }

        await updateChallenge(id, data);
        toast.success("Défi mis à jour !");
        navigate(`/challenges/${id}`);
    };

    if (!challenge) {
        return <p>{t("loading")}</p>;
    }

    return (
        <div className="p-6">
            <h1 className="text-4xl font-semibold mb-4 max-w-xl mx-auto">{t("editChallenge")}</h1>
            <ChallengeForm defaultValues={challenge} onSubmit={handleSubmit} />
        </div>
    );
}

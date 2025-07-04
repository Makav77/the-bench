import { useNavigate } from "react-router-dom";
import ChallengeForm, { ChallengeFormData } from "./ChallengeForm";
import { createChallenge } from "../../../api/challengeService";
import { toast } from "react-toastify";
import usePermission from "../../Utils/usePermission";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

function CreateChallengePage() {
    const navigate = useNavigate();
    const { t } = useTranslation("Community/CreateChallengePage")

    const { restricted, expiresAt, reason } = usePermission("create_challenge");
    if (restricted === null) {
        return <p className="p-6 text-center">{t("checkingPermissions")}</p>;
    }

    if (restricted) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">
                    {t("restrictionMessage")} {" "}
                    {expiresAt
                        ? format(new Date(expiresAt), "dd/MM/yyyy 'at' HH:mm")
                        : "unknown date"}.
                    <br />
                    {reason && (
                        <span>
                            {t("reason")} {reason}
                            <br />
                        </span>
                    )}
                    {t("contactMessage")}
                </p>
            </div>
        );
    }

    const handleSubmit = async (data: ChallengeFormData) => {
        try {
            await createChallenge(data);
            toast.success(t("toastChallengeWaiting"));
            navigate("/challenges");
        } catch {
            toast.error(t("toastChallengeWaitingError"));
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-4xl font-semibold mb-4">{t("createChallenge")}</h1>
            <ChallengeForm onSubmit={handleSubmit} />
        </div>
    );
}

export default CreateChallengePage;

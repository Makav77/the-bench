import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export enum mailState {
    noError = "noError",
    unknowError = "unknowError",
    missingMail = "missingMail",
}

function ResetPassword() {
    const { t } = useTranslation("ResetPassword");
    const navigate = useNavigate();
    const [mailAddress, setMailAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentMailState, setCurrentMailState] = useState<mailState>(
        mailState.noError,
    );

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setMailAddress(e.target.value);
        setCurrentMailState(mailState.noError);
    }

    function getErrorMessage() {
        switch (currentMailState) {
            case mailState.missingMail:
                return t("errorMissingMail");
            default:
                return null;
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!mailAddress) {
            setCurrentMailState(mailState.missingMail);
            return;
        }
        setCurrentMailState(mailState.noError);
        setMailAddress("");
        setIsLoading(true);
        setTimeout(() => {
            navigate("/");
        }, 3000);
    }

    return (
        <div className="bg-white w-1/4 mx-auto mt-20 rounded-[2vw] text-center p-6">
            {!isLoading ? (
                <>
                    <h1 className="text-black font-bold text-4xl mt-5 mb-4">
                        {t("title")}
                    </h1>
                    <h2 className="text-black/38 font-bold mb-4">
                        {t("subtitle1")}
                        <br />
                        {t("subtitle2")}
                    </h2>

                    <form
                        className="mx-auto"
                        onSubmit={handleSubmit}
                    >
                        <input
                            name="email"
                            type="email"
                            aria-label="email-field"
                            autoComplete="off"
                            className={`w-2/3 bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 mb-5 border-gray-500 hover:border-black ${currentMailState === mailState.missingMail && !mailAddress ? "border-red-500 shake" : "border-gray-500"}`}
                            onChange={handleChange}
                            placeholder={t("enterEmail")}
                        />

                        {getErrorMessage() && (
                            <p className="text-red-500 text-sm mb-2 -mt-2 shake italic">
                                {getErrorMessage()}
                            </p>
                        )}

                        <div className="flex justify-center w-3/4 gap-5 mx-auto">
                            <button
                                type="button"
                                className="border-none bg-[#488ACF] text-1xl font-bold w-1/3 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 flex justify-center items-center"
                                aria-label="cancel-button"
                                onClick={() => navigate("/")}
                                disabled={isLoading}
                            >
                                {t("cancel")}
                            </button>

                            <button
                                type="submit"
                                className="border-none bg-[#488ACF] text-1xl font-bold w-2/3 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 flex justify-center items-center"
                                aria-label="send-button"
                                disabled={isLoading}
                            >
                                {t("send")}
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <>
                    <p>You will receive a link to create a new password.</p>
                    <p>Redirect to login page</p>
                    <div 
                        data-testid="spinner"
                        className="w-[32px] h-[32px] m-auto mt-5 aspect-square rounded-full border-6 border-solid border-black border-r-transparent animate-[spin_1s_linear_infinite]" />
                </>
            )}
        </div>
    );
}

export default ResetPassword;

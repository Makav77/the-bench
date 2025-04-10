import { useState } from "react";
import { useTranslation } from "react-i18next";

interface registerCredentials {
    id: string,
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    dateOfBirth: string
};

enum credentialsState {
    noError = "noError",
    missingCredentials = "missingCredentials",
    invalidMailAddress = "invalidMailAddress",
    unknowError = "unknowError"
}

function Signup() {
    const { t } = useTranslation("Register");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [currentCredentialsState, setCurrentCredentialsState] =
        useState<credentialsState>(credentialsState.noError);
    const [formData, setFormData] = useState<registerCredentials>({
        id: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        dateOfBirth: ""
    });

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === "Space") togglePasswordVisibility();
    }

    function getErrorMessage() {
        switch (currentCredentialsState) {
            case credentialsState.missingCredentials:
                return t("missingCredentials");
            case credentialsState.invalidMailAddress:
                return t("invalidCredentials");
            case credentialsState.unknowError:
                return t("unknowError");
            default:
                return null;
        }
    }

    return (
        <div className="bg-white w-[384px] mx-auto mt-20 rounded-[2vw] text-center p-6">
            <h1 className="text-black font-bold text-5xl mt-10 mb-10">
                {t("title")}
            </h1>

            <form
                className="flex flex-col gap-5 w-4/5 mx-auto"
            >
                <input
                    name="firstname"
                    type="text"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ formData.firstname || "" }
                    placeholder={t("firstname")}
                />

                <input
                    name="lastname"
                    type="text"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ formData.lastname || "" }
                    placeholder={t("lastname")}
                />

                <input
                    name="email"
                    type="email"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ formData.email || "" }
                    placeholder={t("email")}
                />

                <div className="relative text-left">
                    <input
                        name="password"
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete="off"
                        className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 w-1/1 hover:border-black"
                        value={formData.password}
                        placeholder={t("password")}
                    />

                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:cursor-pointer"
                        onClick={togglePasswordVisibility}
                        onKeyUp={handleKeyPress}
                    >
                        <img
                            src={
                                isPasswordVisible
                                    ? "assets/password/show-password-32.png"
                                    : "assets/password/hide-password-32.png"
                            }
                            alt="Toggle password visibility"
                        />
                    </button>
                </div>

                <input
                    name="dateOfBirth"
                    type="date"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ formData.dateOfBirth || "" }
                    placeholder={t("dateOfBirth")}
                />

                <div>
                    {getErrorMessage() && (
                        <p className="text-red-500 text-left text-sm -mb-2 -mt-2 shake italic">
                            {getErrorMessage()}
                        </p>
                    )}
                </div>

                <div className="flex gap-5">
                    <button
                        type="button"
                        className="border-none bg-[#488ACF] text-1xl font-bold w-1/3 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 flex justify-center items-center"
                    >
                        {t("cancel")}
                    </button>

                    <button
                        type="submit"
                        className="border-none bg-[#488ACF] text-1xl font-bold w-2/3 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 flex justify-center items-center"
                    >
                        {t("buttonRegister")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Signup;

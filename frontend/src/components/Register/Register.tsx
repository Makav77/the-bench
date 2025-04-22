import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

interface registerCredentials {
    id: string,
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    dateOfBirth: string
};

enum registerState {
    noError = "noError",
    missingCredentials = "missingCredentials",
}

function Signup() {
    const { t } = useTranslation("Register");
    const navigate = useNavigate();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [registerCredentials, setRegisterCredentials] = useState<registerCredentials>({
        id: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        dateOfBirth: ""
    });
    const [currentRegisterState, setCurrentRegisterState] = useState<registerState>(
        registerState.noError
    );

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === "Space") togglePasswordVisibility();
    }

    function getErrorMessage() {
        switch (currentRegisterState) {
            case registerState.missingCredentials:
                return t("missingCredentials");
            default:
                return null;
        }
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        const { name, value } = e.target;
        setRegisterCredentials((prev) => ({ ...prev, [name]: value }));
        setCurrentRegisterState(registerState.noError);
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!registerCredentials.firstname || !registerCredentials.lastname || !registerCredentials.email || !registerCredentials.password || !registerCredentials.dateOfBirth) {
            setCurrentRegisterState(registerState.missingCredentials);
            return;
        }
        setCurrentRegisterState(registerState.noError);
        registerCredentials.id = uuidv4();
        console.log(registerCredentials);
        setRegisterCredentials({
            id: "",
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            dateOfBirth: ""
        });
    }

    return (
        <div className="bg-white w-[90%] sm:w-[20%] mx-auto mt-20 rounded-[6vw] sm:rounded-[2vw] text-center p-6">
            <h1 className="text-black font-bold text-5xl mt-10 mb-2">
                {t("title")}
            </h1>
            <h2 className="text-black/38 text-lg font-bold mb-8">
                {t("subtitle")}
            </h2>

            <form
                className="flex flex-col gap-5 w-4/5 mx-auto"
                onSubmit={handleSubmit}
            >
                <input
                    name="firstname"
                    type="text"
                    autoComplete="off"
                    aria-label="firstname-field"
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-12 sm:h-8 pl-5 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.firstname ? "border-red-500 shake" : "border-gray-500"}`}
                    value={registerCredentials.firstname || ""}
                    onChange={handleChange}
                    placeholder={t("firstname")}
                />

                <input
                    name="lastname"
                    type="text"
                    autoComplete="off"
                    aria-label="lastname-field"
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-12 sm:h-8 pl-5 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.lastname ? "border-red-500 shake" : "border-gray-500"}`}
                    value={registerCredentials.lastname || ""}
                    onChange={handleChange}
                    placeholder={t("lastname")}
                />

                <input
                    name="email"
                    type="email"
                    autoComplete="off"
                    aria-label="email-field"
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-12 sm:h-8 pl-5 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.email ? "border-red-500 shake" : "border-gray-500"}`}
                    value={registerCredentials.email || ""}
                    onChange={handleChange}
                    placeholder={t("email")}
                />

                <div className="relative text-left">
                    <input
                        name="password"
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete="off"
                        aria-label="password-field"
                        className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-12 sm:h-8 pl-5 w-1/1 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.password ? "border-red-500 shake" : "border-gray-500"}`}
                        value={registerCredentials.password}
                        onChange={handleChange}
                        placeholder={t("password")}
                    />

                    <button
                        type="button"
                        aria-label="toggle-password-visibility"
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
                    aria-label="dateOfBirth-field"
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-12 sm:h-8 pl-5 pr-3 text-xl sm:text-base hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.dateOfBirth ? "border-red-500 shake" : "border-gray-500"}`}
                    value={registerCredentials.dateOfBirth || ""}
                    onChange={handleChange}
                    placeholder={t("dateOfBirth")}
                />

                <div>
                    {getErrorMessage() && (
                        <p className="text-red-500 text-left text-sm -mb-2 -mt-2 shake italic">
                            {getErrorMessage()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                    <button
                        type="button"
                        aria-label="cancel-button"
                        className="border-none bg-[#488ACF] text-1xl font-bold h-12 sm:h-10 w-1/2 sm:w-1/3 mx-auto mt-4 mb-1 sm:mb-2 p-2 text-white rounded-lg sm:cursor-pointer sm:transition-all sm:duration-300"
                        onClick={() => navigate("/")}
                    >
                        {t("cancel")}
                    </button>

                    <button
                        type="submit"
                        aria-label="register-button"
                        className="border-none bg-[#488ACF] text-1xl font-bold h-15 sm:h-10 w-1/1 sm:w-2/3 mx-auto mt-1 sm:mt-4 mb-2 p-2 text-white rounded-lg sm:cursor-pointer sm:transition-all sm:duration-300"
                    >
                        {t("register")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Signup;

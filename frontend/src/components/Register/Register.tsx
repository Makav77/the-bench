import { ChangeEvent, FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
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
    invalidMailAddress = "invalidMailAddress",
    unknowError = "unknowError"
}

function Signup() {
    const { t } = useTranslation("Register");
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
            case registerState.invalidMailAddress:
                return t("invalidCredentials");
            case registerState.unknowError:
                return t("unknowError");
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
        console.log(registerCredentials);
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
        <div className="bg-white w-[384px] mx-auto mt-20 rounded-[2vw] text-center p-6">
            <h1 className="text-black font-bold text-5xl mt-10 mb-10">
                {t("title")}
            </h1>

            <form
                className="flex flex-col gap-5 w-4/5 mx-auto"
                onSubmit={handleSubmit}
            >
                <input
                    name="firstname"
                    type="text"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={registerCredentials.firstname || ""}
                    onChange={handleChange}
                    placeholder={t("firstname")}
                />

                <input
                    name="lastname"
                    type="text"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={registerCredentials.lastname || ""}
                    onChange={handleChange}
                    placeholder={t("lastname")}
                />

                <input
                    name="email"
                    type="email"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={registerCredentials.email || ""}
                    onChange={handleChange}
                    placeholder={t("email")}
                />

                <div className="relative text-left">
                    <input
                        name="password"
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete="off"
                        className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 w-1/1 hover:border-black"
                        value={registerCredentials.password}
                        onChange={handleChange}
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

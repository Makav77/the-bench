import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface loginCredentials {
    email: string;
    password: string;
}

function Login() {
    const { t } = useTranslation("Login");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loginCredentials, setLoginCredentials] = useState<loginCredentials>({
        email: "",
        password: "",
    });

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === "Space") {
            togglePasswordVisibility();
        }
    };

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        const { name, value } = e.target;
        setLoginCredentials((prev) => ({ ...prev, [name]: value }));
    };

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        console.log(loginCredentials);
    };

    return (
        <div className="bg-white w-[384px] mx-auto mt-20 rounded-[2vw] text-center p-6">
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
                    name="email"
                    type="email"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ loginCredentials.email || "" }
                    onChange={handleChange}
                    placeholder={t("mailAddress")}
                />

                <div className="relative text-left">
                    <input
                        name="password"
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete="off"
                        className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 w-1/1 hover:border-black"
                        value={loginCredentials.password || ""}
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

                <a
                    href="/"
                    className="text-blue-600 underline text-right -mt-4 hover:cursor-pointer hover:text-blue-800"
                >
                    {t("forgotPassword")}
                </a>

                <div className="text-left flex gap-2">
                    <input
                        name="remember"
                        type="checkbox"
                        autoComplete="off"
                        className="appearance-none w-4 h-4 self-center border-2 border-gray-500 checked:bg-[#F00969] checked:border-black hover:cursor-pointer"
                    />
                    {t("rememberMe")}
                </div>

                <button
                    type="submit"
                    className="border-none bg-[#77B5F5] text-1xl font-bold w-1/2 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 flex justify-center items-center"
                >
                    {t("button")}
                </button>

                <a
                    href="/"
                    className="text-blue-600 underline text-center hover:cursor-pointer hover:text-blue-800"
                >
                    {t("createAccountLink")}
                </a>
            </form>
        </div>
    );
}

export default Login;

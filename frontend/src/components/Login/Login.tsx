import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { loginUser } from "../../api/authService";
import { useAuth } from "../../context/AuthContext";

interface loginCredentials {
    email: string;
    password: string;
    rememberMe: boolean;
}

enum loginState {
    noError = "noError",
    missingCredentials = "missingCredentials",
    invalidCredentials = "invalidCredentials",
}

function Login() {
    const { login } = useAuth();
    const { t } = useTranslation("Login/Login");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginCredentials, setLoginCredentials] = useState<loginCredentials>({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [currentLoginState, setCurrentLoginState] = useState<loginState>(
        loginState.noError
    );

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === "Space") {
            togglePasswordVisibility();
        }
    };

    function getErrorMessage() {
        switch (currentLoginState) {
            case loginState.missingCredentials:
                return t("missingCredentials");
            case loginState.invalidCredentials:
                return t("invalidCredentials");
            default:
                return null;
        }
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        const { name, value } = e.target;
        setLoginCredentials((prev) => ({
            ...prev,
            [name]: value
        }));
        setCurrentLoginState(loginState.noError);
    };

    function handleCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
        setLoginCredentials(prev => ({
            ...prev,
            rememberMe: e.target.checked,
        }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const email = loginCredentials.email.trim();
        const password = loginCredentials.password.trim();

        if (!email || !password) {
            setCurrentLoginState(loginState.missingCredentials);
            return;
        }
        setCurrentLoginState(loginState.noError);
        setIsLoading(true);
        try {
            const data = await loginUser({...loginCredentials, email, password});

            if (data?.accessToken) {
                login(data.accessToken);
            } else {
                setCurrentLoginState(loginState.invalidCredentials);
            }
        } catch {
            setCurrentLoginState(loginState.invalidCredentials)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white w-[384px] mx-auto mt-20 rounded-[2vw] text-center p-6 max-sm:w-[92vw] max-sm:rounded-[5vw] max-sm:mt-8 max-sm:p-4">
            <h1 className="text-black font-bold text-5xl mt-10 mb-2 max-sm:text-4xl max-sm:mt-4 max-sm:mb-2">
                {t("title")}
            </h1>
            <h2 className="text-black/38 text-lg font-bold mb-8 max-sm:text-xl max-sm:mb-6">
                {t("subtitle")}
            </h2>

            <form
                className="flex flex-col gap-5 w-4/5 mx-auto max-sm:w-full max-sm:gap-4"
                onSubmit={handleSubmit}
            >
                <input
                    name="email"
                    type="email"
                    aria-label="email-field"
                    autoComplete="off"
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black ${currentLoginState === loginState.missingCredentials && !loginCredentials.email ? "border-red-500 shake" : "border-gray-500"} max-sm:h-12 max-sm:text-lg`}
                    value={loginCredentials.email || ""}
                    onChange={handleChange}
                    placeholder={t("mailAddress")}
                />

                <div className="relative text-left">
                    <input
                        name="password"
                        type={isPasswordVisible ? "text" : "password"}
                        aria-label="password-field"
                        autoComplete="off"
                        className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 w-1/1 hover:border-black ${currentLoginState === loginState.missingCredentials && !loginCredentials.password ? "border-red-500 shake" : "border-gray-500"} max-sm:h-12 max-sm:text-lg`}
                        value={loginCredentials.password || ""}
                        onChange={handleChange}
                        placeholder={t("password")}
                    />

                    <button
                        type="button"
                        aria-label="toggle-password-visibility"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer max-sm:right-2"
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
                    href="/resetpassword"
                    aria-label="forgot-password-link"
                    className="text-blue-600 underline text-right -mt-4 hover:cursor-pointer hover:text-blue-800 max-sm:text-base max-sm:-mt-2"
                >
                    {t("forgotPassword")}
                </a>

                {getErrorMessage() && (
                    <p className="text-red-500 text-left text-sm -mb-2 -mt-2 shake italic max-sm:text-base">
                        {getErrorMessage()}
                    </p>
                )}

                <div className="text-left flex gap-2 max-sm:gap-3 items-center">
                    <input
                        name="rememberMe"
                        type="checkbox"
                        aria-label="rememberMe-checkbox"
                        autoComplete="off"
                        className="appearance-none w-4 h-4 self-center border-2 border-gray-500 checked:bg-[#F00969] checked:border-black hover:cursor-pointer max-sm:w-6 max-sm:h-6"
                        checked={loginCredentials.rememberMe}
                        onChange={handleCheckboxChange}
                    />
                    <span className="max-sm:text-lg">{t("rememberMe")}</span>
                </div>

                <button
                    type="submit"
                    aria-label="login-button"
                    className="border-none bg-[#488ACF] text-1xl font-bold w-1/2 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 max-sm:w-full max-sm:text-2xl max-sm:py-3 max-sm:rounded-xl"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div
                            data-testid="spinner"
                            className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin max-sm:w-7 max-sm:h-7" />
                    ) : (
                        t("buttonLogin")
                    )}
                </button>

                <a
                    href="/register"
                    aria-label="register-link"
                    className="text-blue-600 underline text-center hover:cursor-pointer hover:text-blue-800 max-sm:text-base"
                >
                    {t("createAccountLink")}
                </a>
            </form>
        </div>
    );
}

export default Login;

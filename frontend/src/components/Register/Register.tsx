import type { ChangeEvent, FormEvent } from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { createUser, Role } from "../../api/userService";
import { getCitiesByPostalCode, resolveIris } from "../../api/irisService";

interface registerCredentials {
    id: string,
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    dateOfBirth: string,
    profilePicture: string,
    role: Role,
    street: string,
    postalCode: string,
    city: string,
    irisCode: string,
    irisName: string,
};

enum registerState {
    noError = "noError",
    missingCredentials = "missingCredentials",
}

function Signup() {
    const { t } = useTranslation("Register/Register");
    const navigate = useNavigate();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [registerCredentials, setRegisterCredentials] = useState<registerCredentials>({
        id: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        dateOfBirth: "",
        profilePicture: "",
        role: Role.USER,
        street: "",
        postalCode: "",
        city: "",
        irisCode: "",
        irisName: "",
    });
    const [currentRegisterState, setCurrentRegisterState] = useState<registerState>(registerState.noError);
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const [irisError, setIrisError] = useState<string>("");

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
        setRegisterCredentials((prev) => ({ 
            ...prev,
            [name]: value
        }));
        setCurrentRegisterState(registerState.noError);
    }

    async function handleStreetChange(e: ChangeEvent<HTMLInputElement>) {
        const addressValue = e.target.value;
        setRegisterCredentials(prev => ({
            ...prev,
            street: addressValue,
        }));
        setCurrentRegisterState(registerState.noError);
    }

    async function handlePostalCodeChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value.replace(/\D/g, "");
        setRegisterCredentials(prev => ({
            ...prev,
            postalCode: value,
            city: "",
            irisCode: "",
            irisName: "",
        }));
        setIrisError("");

        if (value.length === 5) {
            try {
                const cities = await getCitiesByPostalCode(value);
                setCitySuggestions(cities);
                setShowCitySuggestions(true);
            } catch {
                setCitySuggestions([]);
                setShowCitySuggestions(false);
            }
        } else {
            setCitySuggestions([]);
            setShowCitySuggestions(false);
        }
    }

    function handleCityChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setRegisterCredentials(prev => ({
            ...prev,
            city: value,
        }));
        setIrisError("");
    }

    function handleSelectCity(city: string) {
        setRegisterCredentials(prev => ({
            ...prev,
            city: city,
        }));
        setShowCitySuggestions(false);
        setIrisError("");
    }

    useEffect(() => {
        const { street, postalCode, city } = registerCredentials;
        if (street && postalCode.length === 5 && city) {
            resolveIris(street, postalCode, city)
                .then(({ irisCode, irisName }) => {
                    setRegisterCredentials(prev => ({
                        ...prev,
                        irisCode,
                        irisName,
                    }));
                    setIrisError("");
                })
                .catch(() => {
                    setRegisterCredentials(prev => ({
                        ...prev,
                        irisCode: "",
                        irisName: "",
                    }));
                    setIrisError("Impossible de trouver le quartier pour cette adresse.");
                });
        } else {
            setRegisterCredentials(prev => ({
                ...prev,
                irisCode: "",
                irisName: "",
            }));
            setIrisError("");
        }
    }, [registerCredentials.street, registerCredentials.postalCode, registerCredentials.city]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (
            !registerCredentials.firstname ||
            !registerCredentials.lastname ||
            !registerCredentials.email ||
            !registerCredentials.password ||
            !registerCredentials.dateOfBirth ||
            !registerCredentials.street ||
            !registerCredentials.postalCode ||
            !registerCredentials.city ||
            !registerCredentials.irisCode ||
            !registerCredentials.irisName
        ) {
            setCurrentRegisterState(registerState.missingCredentials);
            return;
        }
        setCurrentRegisterState(registerState.noError);
        registerCredentials.id = uuidv4();

        const address = `${registerCredentials.street}, ${registerCredentials.postalCode} ${registerCredentials.city}`.trim();

        const userToSend = {
            id: registerCredentials.id,
            firstname: registerCredentials.firstname,
            lastname: registerCredentials.lastname,
            email: registerCredentials.email,
            password: registerCredentials.password,
            dateOfBirth: registerCredentials.dateOfBirth,
            profilePicture: registerCredentials.profilePicture,
            role: registerCredentials.role,
            address: address,
            irisCode: registerCredentials.irisCode,
            irisName: registerCredentials.irisName,
        };

        try {
            await createUser(userToSend);
            navigate("/");
        } catch (error) {
            console.error(error);
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
                    name="firstname"
                    type="text"
                    aria-label="firstname-field"
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.firstname ? "border-red-500 shake" : "border-gray-500"} max-sm:h-12 max-sm:text-lg`}
                    value={registerCredentials.firstname || ""}
                    onChange={handleChange}
                    placeholder={t("firstname")}
                />

                <input
                    name="lastname"
                    type="text"
                    aria-label="lastname-field"
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.lastname ? "border-red-500 shake" : "border-gray-500"} max-sm:h-12 max-sm:text-lg`}
                    value={registerCredentials.lastname || ""}
                    onChange={handleChange}
                    placeholder={t("lastname")}
                />

                <input
                    name="email"
                    type="email"
                    aria-label="email-field"
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.email ? "border-red-500 shake" : "border-gray-500"} max-sm:h-12 max-sm:text-lg`}
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
                        className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 w-1/1 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.password ? "border-red-500 shake" : "border-gray-500"} max-sm:h-12 max-sm:text-lg`}
                        value={registerCredentials.password}
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

                <input
                    name="dateOfBirth"
                    type="date"
                    autoComplete="off"
                    aria-label="dateOfBirth-field"
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.dateOfBirth ? "border-red-500 shake" : "border-gray-500"} max-sm:h-12 max-sm:text-lg`}
                    value={registerCredentials.dateOfBirth || ""}
                    onChange={handleChange}
                    placeholder={t("dateOfBirth")}
                />

                <input
                    name="street"
                    type="text"
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.street ? "border-red-500 shake" : "border-gray-500"} max-sm:h-12 max-sm:text-lg`}
                    value={registerCredentials.street}
                    onChange={handleStreetChange}
                    placeholder="12 rue Rivoli"
                />

                <input
                    name="postalCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={5}
                    className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.postalCode ? "border-red-500 shake" : "border-gray-500"} max-sm:h-12 max-sm:text-lg`}
                    value={registerCredentials.postalCode}
                    onChange={handlePostalCodeChange}
                    placeholder="75010"
                />

                <div className="relative">
                    <input
                        name="city"
                        type="text"
                        className={`bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black ${currentRegisterState === registerState.missingCredentials && !registerCredentials.city ? "border-red-500 shake" : "border-gray-500"} max-sm:h-12 max-sm:text-lg`}
                        value={registerCredentials.city}
                        onChange={handleCityChange}
                        placeholder="Paris"
                        onFocus={() => setShowCitySuggestions(citySuggestions.length > 0)}
                    />

                    {showCitySuggestions && citySuggestions.length > 0 && (
                        <ul className="absolute z-10 bg-white border-gray-300 w-full rounded shadow max-h-48 overflow-y-auto mt-1">
                            {citySuggestions.map((city, index) => (
                                <li
                                    key={index}
                                    className="px-4 py-2 hover:bg-amber-100 cursor-pointer"
                                    onClick={() => handleSelectCity(city)}
                                >
                                    {city}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {registerCredentials.irisName && (
                    <div className="text-sm text-amber-700 italic text-left pl-1">
                        {t("neighborhoodSelected")} <span className="font-bold">{registerCredentials.irisName}</span>
                    </div>
                )}

                {irisError && (
                    <div className="text-sm text-red-500 italic text-left pl-1">{irisError}</div>
                )}

                <div>
                    {getErrorMessage() && (
                        <p className="text-red-500 text-left text-sm -mb-2 -mt-2 shake italic max-sm:text-base">
                            {getErrorMessage()}
                        </p>
                    )}
                </div>

                <div className="flex gap-5 max-sm:gap-3">
                    <button
                        type="button"
                        aria-label="cancel-button"
                        className="border-none bg-[#488ACF] text-1xl font-bold w-1/3 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 flex justify-center items-center max-sm:w-2/5 max-sm:text-lg max-sm:py-3 max-sm:rounded-xl"
                        onClick={() => navigate("/")}
                    >
                        {t("cancel")}
                    </button>

                    <button
                        type="submit"
                        aria-label="register-button"
                        className="border-none bg-[#488ACF] text-1xl font-bold w-2/3 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 flex justify-center items-center max-sm:w-3/5 max-sm:text-lg max-sm:py-3 max-sm:rounded-xl"
                    >
                        {t("buttonRegister")}
                    </button>
                </div>
            </form>
        </div>
    );

}

export default Signup;

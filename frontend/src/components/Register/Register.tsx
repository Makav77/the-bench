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

function Signup() {
    const { t } = useTranslation("Register");
    const [formData, setFormData] = useState<registerCredentials>({
        id: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        dateOfBirth: ""
    });

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

                <input
                    name="password"
                    type="password"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ formData.password || "" }
                    placeholder={t("password")}
                />

                <input
                    name="dateOfBirth"
                    type="date"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ formData.dateOfBirth || "" }
                    placeholder={t("dateOfBirth")}
                />

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

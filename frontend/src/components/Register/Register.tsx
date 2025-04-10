import { useState } from "react";

interface registerCredentials {
    id: string,
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    dateOfBirth: string
};

function Signup() {
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
            <h1 className="text-black font-bold text-5xl mt-10 mb-2">
                title
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
                    placeholder="Firstname"
                />

                <input
                    name="lastname"
                    type="text"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ formData.lastname || "" }
                    placeholder="Lastname"
                />

                <input
                    name="email"
                    type="email"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ formData.email || "" }
                    placeholder="Email"
                />

                <input
                    name="password"
                    type="password"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ formData.password || "" }
                    placeholder="Password"
                />

                <input
                    name="dateOfBirth"
                    type="date"
                    autoComplete="off"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ formData.dateOfBirth || "" }
                    placeholder="Firstname"
                />

                <div className="flex gap-5">
                    <button
                        type="button"
                        className="border-none bg-[#488ACF] text-1xl font-bold w-1/3 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 flex justify-center items-center"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="border-none bg-[#488ACF] text-1xl font-bold w-2/3 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 flex justify-center items-center"
                    >
                        Register
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Signup;

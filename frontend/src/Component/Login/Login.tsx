import { useState } from "react";

interface loginCredentials {
    email: string;
    password: string;
}

function Login() {
    const [loginCredentials, setLoginCredentials] = useState<loginCredentials>({
        email: "",
        password: "",
    });

    return (
        <div className="bg-[#F0F1EA] w-[384px] mx-auto mt-20 rounded-[2vw] text-center p-6">
            <h1 className="text-black font-bold text-5xl mt-10 mb-2">
                LOGIN
            </h1>
            <h2 className="text-black/38 text-lg font-bold mb-8">
                Please enter your details below
            </h2>

            <form
                className="flex flex-col gap-5 w-4/5 mx-auto"
            >
                <input
                    name="email"
                    type="email"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 hover:border-black"
                    value={ loginCredentials.email || "" }
                    placeholder="Email"
                />

                <input
                    name="password"
                    type="password"
                    className="bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 w-1/1 hover:border-black"
                    value={ loginCredentials.password || "" }
                    placeholder="Password"
                />

                <a
                    href="/"
                    className="text-blue-600 underline text-right -mt-4 hover:cursor-pointer hover:text-blue-800"
                >
                    Forgot password?
                </a>

                <div className="text-left flex gap-2">
                    <input
                        name="remember"
                        type="checkbox"
                        autoComplete="off"
                        className="appearance-none w-4 h-4 self-center border-2 border-gray-500 checked:bg-[#F00969] checked:border-black hover:cursor-pointer"
                    />
                    Remember me
                </div>

                <button
                    type="submit"
                    className="border-none bg-[#77B5F5] text-1xl font-bold w-1/2 mx-auto mt-7 mb-2 p-2 text-white rounded-lg cursor-pointer transition-all duration-300 flex justify-center items-center"
                >
                    LOGIN
                </button>

                <a
                    href="/"
                    className="text-blue-600 underline text-center hover:cursor-pointer hover:text-blue-800"
                >
                    Don't have an account? Sign up
                </a>
            </form>
        </div>
    );
}

export default Login;

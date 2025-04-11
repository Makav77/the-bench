import { useState } from "react";

function ResetPassword() {
    const [mailAddress, setMailAddress] = useState("");

    return (
        <div className="bg-white w-1/4 mx-auto mt-20 rounded-[2vw] text-center p-6">
            <h1 className="text-black font-bold text-4xl mt-5 mb-4">
                Forgot password?
            </h1>
            <h2 className="text-black/38 font-bold mb-4">
                Please enter your email address.
                <br />
                You will receive a link to create a new password.
            </h2>

            <form className="mx-auto">
                <input
                    name="email"
                    type="email"
                    autoComplete="off"
                    className="w-2/3 bg-[#F2EBDC] text-black border-2 rounded-xl h-8 pl-5 mb-5 border-gray-500 hover:border-black"
                    placeholder="Mail Address"
                />

                <div className="flex justify-center w-3/4 gap-5 mx-auto">
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
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ResetPassword;

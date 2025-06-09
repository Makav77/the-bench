import { useNavigate } from "react-router-dom";

function Footer() {
    const navigate = useNavigate();

    return (
        <div
            data-test-id="footer"
            className="bg-[#4A93C9] border-t-2 mt-10"
        >
            <div className="flex justify-between w-[30%] mx-auto mt-5 p-6">
                <div className="flex flex-col items-start space-y-1">
                    <p className="font-semibold">See also :</p>
                    <button
                        type="button"
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate("/homepage")}
                    >
                        → Homepage
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate("/marketplace")}
                    >
                        → Marketplace
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate("/bulletinsboard")}
                    >
                        → Bulletins board
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate("/events")}
                    >
                        → Events
                    </button>

                    <button
                        type="button"
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate("/community")}
                    >
                        → Community
                    </button>
                </div>

                <div>
                    <div>
                        <ul>
                            <li>Contact a moderator</li>
                            <li>Conditions of use</li>
                        </ul>
                    </div>

                    <br />

                    <div>
                        <ul>
                            <li className="flex gap-3 hover:underline cursor-pointer" onClick={() => navigate("https://github.com/NabilBoubekri")}><img src="../../../public/assets/github-logo.png" alt="github-logo" className="h-5" />NabilBoubekri</li>
                            <li className="flex gap-3 hover:underline cursor-pointer" onClick={() => navigate("https://github.com/ksarlary")}><img src="../../../public/assets/github-logo.png" alt="github-logo" className="h-5"/>ksarlary</li>
                            <li className="flex gap-3 hover:underline cursor-pointer" onClick={() => navigate("https://github.com/Makav77")}><img src="../../../public/assets/github-logo.png" alt="github-logo" className="h-5"/>Makav77</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            
            
            
            
            <p className="text-l font-bold text-center">The Bench © 2025</p>
        </div>
    );
}

export default Footer;

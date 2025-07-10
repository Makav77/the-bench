import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

function Navigation() {
    const { t } = useTranslation("Navigation/Navigation");
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const burgerRef = useRef<HTMLButtonElement>(null);

    const navLinks = [
        { to: "/homepage", label: t("homePage"), match: ["/homepage"] },
        { to: "/marketplace", label: t("marketplace"), match: ["/marketplace", "/market"] },
        { to: "/bulletinsboard", label: t("listings"), match: ["/bulletinsboard", "/posts", "/flashposts"] },
        { to: "/events", label: t("events"), match: ["/events"] },
        { to: "/community", label: t("community"), match: ["/community", "/gallery", "/polls", "/challenges", "/calendar", "/artisans", "/news"] },
    ];

    const isActive = (matchArr: string[]) => matchArr.some((m) => location.pathname.startsWith(m));
    const currentLink = navLinks.find((link) => isActive(link.match));
    const currentLabel = currentLink ? currentLink.label : t("menu");

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const menuNode = menuRef.current;
            const burgerNode = burgerRef.current;
            if (
                menuOpen &&
                menuNode &&
                burgerNode &&
                !menuNode.contains(e.target as Node) &&
                !burgerNode.contains(e.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener("mousedown", handleClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [menuOpen]);

    return (
        <nav
            data-testid="navigation-bar" 
            className="relative"
        >
            <div className="grid grid-cols-5 gap-1 m-2 mt-10 pt-5 mb-5 w-[75%] mx-auto border-t-1 max-sm:hidden">
                {navLinks.map((link) => (
                    <button
                        key={link.to}
                        type="button"
                        aria-label={link.label + "-button"}
                        className={`w-[75%] mx-auto text-xl font-semibold cursor-pointer transition-all duration-300 ${isActive(link.match) ? "text-white" : "hover:underline"}`}
                        onClick={() => navigate(link.to)}
                    >
                        {link.label}
                    </button>
                ))}
            </div>

            <div className="hidden max-sm:block w-[90%] h-[2px] bg-black mx-auto rounded-full" />

            <div className="hidden max-sm:flex items-center justify-center w-full px-4 mt-0 relative bg-[#00c6ff] min-h-[56px] rounded-xl">
                <span className="font-bold text-lg text-white mx-auto">
                    {currentLabel}
                </span>
                <button
                    ref={burgerRef}
                    className="flex flex-col justify-center items-center w-10 h-10 absolute right-4 top-1/2 -translate-y-1/2 z-50"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    onClick={() => setMenuOpen((prev) => !prev)}
                >
                    <span className={`block h-1 w-8 bg-white rounded transition-all duration-200 mb-1 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
                    <span className={`block h-1 w-8 bg-white rounded transition-all duration-200 mb-1 ${menuOpen ? "opacity-0" : ""}`}></span>
                    <span className={`block h-1 w-8 bg-white rounded transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
                </button>
            </div>

            {menuOpen && (
                <div
                    ref={menuRef}
                    className="absolute left-0 right-0 z-50 flex flex-col items-center gap-2 mt-2 max-sm:bg-white max-sm:shadow max-sm:rounded-b-xl max-sm:py-2"
                >
                    {navLinks.filter(link => !isActive(link.match)).map((link) => (
                        <button
                            key={link.to}
                            type="button"
                            aria-label={link.label + "-mobile-button"}
                            className="w-[90vw] max-w-xs py-3 text-base font-semibold rounded hover:bg-blue-100 transition-all duration-150"
                            onClick={() => {
                                setMenuOpen(false);
                                navigate(link.to);
                            }}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    );
}

export default Navigation;

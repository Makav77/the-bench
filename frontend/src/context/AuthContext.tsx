import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { refreshToken } from "../api/authService";

interface AuthContextType {
    accessToken: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    accessToken: null,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const initializeAuth = async() => {
            try {
                const data = await refreshToken();
                setAccessToken(data.accessToken);
                localStorage.setItem("accessToken", data.accessToken);
            } catch(error) {
                console.error("Unable to refresh token on intialisation :", error);
                setAccessToken(null);
                localStorage.removeItem("accessToken");
            }
        };
        initializeAuth();
    }, []);

    const login = (token: string) => {
        setAccessToken(token);
        localStorage.setItem("accessToken", token);
    };

    const logout = () => {
        setAccessToken(null);
        localStorage.removeItem("accessToken");
        // TODO add endpoint for logout
    };

    return (
        <AuthContext.Provider value={{ accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

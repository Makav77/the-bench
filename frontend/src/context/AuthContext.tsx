import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { fetchMe, refreshToken } from "../api/authService";
import { User } from "../../../backend/src/modules/Users/entities/user.entity";

interface AuthContextType {
    accessToken: string | null;
    user: User | null,
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    accessToken: null,
    user: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
    refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const isAuthenticated = Boolean(accessToken);

    useEffect(() => {
        (async () => {
            try {
                const { accessToken: newToken } = await refreshToken();
                setAccessToken(newToken);
                localStorage.setItem("accessToken", newToken);
                const me = await fetchMe();
                setUser(me);
            } catch {
                logoutCleanup();
            }
        })();
    }, []);

    const refreshUser = async () => {
        try {
            const me = await fetchMe();
            setUser(me);
        } catch {
            setUser(null);
        }
    };

    const login = (token: string) => {
        setAccessToken(token);
        localStorage.setItem("accessToken", token);
        refreshUser();
    };

    const logout = () => {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
    };

    const logoutCleanup = () => {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
      };

    return (
        <AuthContext.Provider value={{ accessToken, user, login, logout, isAuthenticated, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

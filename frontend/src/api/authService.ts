import axios from "axios";

interface userCredentials {
    email: string;
    password: string;
    rememberMe: boolean;
};

const API_URL = "http://localhost:3000/login";

export const loginUser = async(userCredentials: userCredentials) => {
    try {
        const response = await axios.post(API_URL, userCredentials);
        return response.data;
    } catch(error) {
        console.error("Login error : " + error);
    }
}

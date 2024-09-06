//read APU_URL from .env file
const VITE_API_URL = import.meta.env.VITE_API_URL;

export const login = async (username, password) => {
    try {
        const response = await fetch(`${VITE_API_URL}/user/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const loginOtp = async (otp) => {
    try {
        const response = await fetch(`${VITE_API_URL}/user/login/otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ otp }),
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const logout = async () => {
    try {
        const response = await fetch(`${VITE_API_URL}/user/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const verifyRole = async (roles) => {
    try {
        const response = await fetch(`${VITE_API_URL}/user/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ roles }),
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const authenticateUser = async () => {
    try {
        const response = await fetch(`${VITE_API_URL}/user/auth`, {
            method: "POST",
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const userExpiration = async () => {
    try {
        const response = await fetch(`${VITE_API_URL}/user/exp`, {
            method: "POST",
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};

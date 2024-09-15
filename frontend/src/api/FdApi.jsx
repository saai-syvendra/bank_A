const VITE_API_URL = import.meta.env.VITE_API_URL;
const FD_API_URL = `${VITE_API_URL}/fd`;

export const callGetCustomerFds = async (customerId) => {
    try {
        const response = await fetch(`${FD_API_URL}/get-all`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ customerId }),
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data.fds;
    } catch (error) {
        throw new Error(error.message);
    }
};

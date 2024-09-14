const VITE_API_URL = import.meta.env.VITE_API_URL;
const CUSTOMER_API_URL = `${VITE_API_URL}/customer`;

export const callCreateCustomer = async (cType, customerDetails) => {
    try {
        const response = await fetch(`${CUSTOMER_API_URL}/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ cType, customerDetails }),
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

export const callGetCustomerNames = async () => {
    try {
        const response = await fetch(`${CUSTOMER_API_URL}/all-names`, {
            method: "GET",
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data.customers;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const callGetCustomer = async (customerId) => {
    try {
        const response = await fetch(`${CUSTOMER_API_URL}`, {
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

        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};
const VITE_API_URL = import.meta.env.VITE_API_URL;
const LOAN_API_URL = `${VITE_API_URL}/loan`;

export const callCreateLoan = async (data) => {
    try {
        const response = await fetch(`${LOAN_API_URL}/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
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

export const callCreateOnlineLoan = async (data) => {
    try {
        const response = await fetch(`${LOAN_API_URL}/create-online`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
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

export const callGetLoanPlans = async () => {
    try {
        const response = await fetch(`${LOAN_API_URL}/plans`, {
            method: "GET",
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data.plans;
    } catch (error) {
        throw new Error(error.message);
    }
};

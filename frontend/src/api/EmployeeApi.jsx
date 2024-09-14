const VITE_API_URL = import.meta.env.VITE_API_URL;
const EMPLOYEE_API_URL = `${VITE_API_URL}/employee`;

export const callGetEmployeeDetail = async () => {
    try {
        const response = await fetch(`${EMPLOYEE_API_URL}/detail`, {
            method: "GET",
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};

export const callUpdateEmployeeDetail = async (data) => {
    try {
        const response = await fetch(`${EMPLOYEE_API_URL}/update`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message);
        }

        return responseData;
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};

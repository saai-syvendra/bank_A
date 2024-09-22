const VITE_API_URL = import.meta.env.VITE_API_URL;
const TRANSACTION_API_URL = `${VITE_API_URL}/transaction`;

export const callEmployeeDepositForCustomer = async (data) => {
  try {
    const response = await fetch(
      `${TRANSACTION_API_URL}/employee/make-deposit`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

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

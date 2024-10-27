const VITE_API_URL = import.meta.env.VITE_API_URL;
const MACHINE_API_URL = `${VITE_API_URL}/machine`;

export const callMakeCDMdeposit = async (data) => {
  try {
    const response = await fetch(`${MACHINE_API_URL}/cdm-deposit`, {
      method: "POST",
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

export const callGetCDMInformation = async (accountNo) => {
  try {
    const response = await fetch(
      `${MACHINE_API_URL}/get-cdm-info?accountNo=${accountNo}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const callMakATMWithdrawal = async (data) => {
  try {
    const response = await fetch(`${MACHINE_API_URL}/atm-withdrawal`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error);
    }

    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}
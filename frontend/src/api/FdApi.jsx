const VITE_API_URL = import.meta.env.VITE_API_URL;
const FD_API_URL = `${VITE_API_URL}/fd`;

export const callGetCustomerFds = async () => {
  try {
    const response = await fetch(`${FD_API_URL}/my-fds`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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

export const callGetFdPlans = async () => {
  try {
    const response = await fetch(`${FD_API_URL}/plans`, {
      method: "GET",
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

export const callCreateFd = async (data) => {
  try {
    const response = await fetch(`${FD_API_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

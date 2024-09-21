const VITE_API_URL = import.meta.env.VITE_API_URL;
const ACCOUNT_API_URL = `${VITE_API_URL}/account`;

export const callCreateAccount = async (account) => {
  try {
    const response = await fetch(`${ACCOUNT_API_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(account),
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

export const callGetSavingPlans = async () => {
  try {
    const response = await fetch(`${ACCOUNT_API_URL}/saving-plans`, {
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

export const callGetAccount = async (accountNumber) => {
  try {
    const response = await fetch(`${CUSTOMER_API_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountNumber }),
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

export const callGetCustomerAccounts = async (customerId) => {
  try {
    const response = await fetch(`${ACCOUNT_API_URL}/${customerId}`, {
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

export const callGetThisCustomerAccounts = async () => {
  try {
    const response = await fetch(`${ACCOUNT_API_URL}/my-accounts`, {
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

export const callGetCustomerAccountTransactions = async (customerId) => {
  try {
    const response = await fetch(
      `${ACCOUNT_API_URL}/my-transactions/${customerId}`,
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

    return data.transactions;
  } catch (error) {
    throw new Error(error.message);
  }
};

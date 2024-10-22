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
    const response = await fetch(`${ACCOUNT_API_URL}`, {
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

export const callGetThisCustomerAccounts = async (accountType) => {
  if (!accountType) accountType = "";
  const params = new URLSearchParams();
  params.set("accountType", accountType);
  try {
    const response = await fetch(
      `${ACCOUNT_API_URL}/my-accounts?${params.toString()}`,
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

export const callGetCustomerAccountTransactions = async ({
  startDate,
  transactionType,
  minAmount,
  maxAmount,
  method,
  accountId,
}) => {
  const params = new URLSearchParams();
  params.set("startDate", startDate);
  params.set("transactionType", transactionType);
  params.set("minAmount", minAmount);
  params.set("maxAmount", maxAmount);
  params.set("method", method);
  params.set("accountId", accountId);
  console.log(params.toString());
  try {
    const response = await fetch(
      `${ACCOUNT_API_URL}/my-transactions?${params.toString()}`,
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

export const callGetBranchAccountTransactions = async ({
  startDate,
  transactionType,
  minAmount,
  maxAmount,
  method,
  accountId,
}) => {
  const params = new URLSearchParams();
  params.set("startDate", startDate);
  params.set("transactionType", transactionType);
  params.set("minAmount", minAmount);
  params.set("maxAmount", maxAmount);
  params.set("method", method);
  params.set("accountId", accountId);
  console.log(params.toString());
  try {
    const response = await fetch(
      `${ACCOUNT_API_URL}/branch-transactions?${params.toString()}`,
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

export const callGetBranchAccounts = async () => {
  try {
    const response = await fetch(`${ACCOUNT_API_URL}/branch-accounts`, {
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

export const callGetAccountIDfromAccountNo = async (accountNo) => {
  try {
    const response = await fetch(`${ACCOUNT_API_URL}/get-account-id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountNo }),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data.account_id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const callGetATMInformation = async (accountNo) => {
  try {
    const response = await fetch(
      `${ACCOUNT_API_URL}/get-atm-info?accountNo=${accountNo}`,
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



const VITE_API_URL = import.meta.env.VITE_API_URL;
const TRANSACTION_API_URL = `${VITE_API_URL}/transaction`;
const REPORT_API_URL = `${VITE_API_URL}/report`;

export const callEmployeeDepositForCustomer = async (data) => {
  try {
    const { account_id, amount, reason } = data; // Destructure the required fields
    const response = await fetch(
      `${TRANSACTION_API_URL}/employee/make-deposit`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account_id: account_id, amount, reason }), // Send only the required fields
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

export const callMakeOnlineTransfer = async (data) => {
  try {
    const response = await fetch(`${TRANSACTION_API_URL}/online-transfer`, {
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

export const callGetFilteredTransReports = async ({
  start__date,
  end__date,
  min__amount,
  max__amount,
  transaction__type,
  transaction__method,   // Additional filters if needed
  branch__code
}) => {
  try {
    // Prepare the request body with the filters
    const requestBody = {
      start_date: start__date || null,             // Use double underscore here
      end_date: end__date || null,                 // Use double underscore here
      min_amount: min__amount || null,             // Use double underscore here
      max_amount: max__amount || null,             // Use double underscore here
      transaction_type: transaction__type !== 'all' ? transaction__type : null, // Use double underscore here
      transaction_method: transaction__method || null,  // Use double underscore here
      branch_code: branch__code || null  // Use double underscore here
    };

  
    const response = await fetch(`${REPORT_API_URL}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",  
      body: JSON.stringify(requestBody),  
    });

    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch transaction report data');
    }

    return data;  
  } catch (error) {
    console.error('Error fetching transaction reports:', error.message);
    throw new Error(error.message);
  }
};

export const callGetTransactionReports = async ({
  startDate,
  endDate,
  transactionType,
  transaction__method, 
  branch__code,
  time
}) => {
  try {
    
    const requestBody = {
      start_date:startDate || null,             // Use double underscore here
      end_date: endDate || null,                 // Use double underscore here
      transaction_type: transactionType !== 'all' ? transactionType : null, // Use double underscore here
      transaction_method: transaction__method || null,  // Use double underscore here
      branch_code: branch__code || null,  // Use double underscore here
      report_period:time||null
    };

  
    const response = await fetch(`${REPORT_API_URL}/overall-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",  
      body: JSON.stringify(requestBody),
    });

    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch transaction report data');
    }

    return data; 
  } catch (error) {
    console.error('Error fetching transaction reports:', error.message);
    throw new Error(error.message);
  }
};


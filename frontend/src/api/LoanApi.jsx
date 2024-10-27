const VITE_API_URL = import.meta.env.VITE_API_URL;
const LOAN_API_URL = `${VITE_API_URL}/loan`;
const REPORT_API_URL = `${VITE_API_URL}/report`;

export const callCreateLoan = async (loan) => {
  try {
    const response = await fetch(`${LOAN_API_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loan),
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

export const callCreateOnlineLoan = async (loan) => {
  try {
    const response = await fetch(`${LOAN_API_URL}/create-online`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loan),
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

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const callGetApprovalPendingLoans = async () => {
  try {
    const response = await fetch(`${LOAN_API_URL}/approval-pending`, {
      method: "GET",
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

export const callApproveLoan = async (loanId) => {
  try {
    const response = await fetch(`${LOAN_API_URL}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loanId }),
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

export const callRejectLoan = async (loanId) => {
  try {
    const response = await fetch(`${LOAN_API_URL}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loanId }),
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

export const callGetUpcomingInstallments = async () => {
  try {
    const response = await fetch(`${LOAN_API_URL}/upcoming-installments`, {
      method: "GET",
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

export const callPayInstallment = async (loanId, installmentNo, accountId) => {
  try {
    const response = await fetch(`${LOAN_API_URL}/pay-installment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loanId, installmentNo, accountId }),
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

export const callGetLateLoanInstallments = async (filters) => {
  const params = new URLSearchParams();
  params.set("minAmount", filters.minAmount);
  params.set("maxAmount", filters.maxAmount);
  params.set("customerId", filters.customerId);
  params.set("startDate", filters.startDate);
  params.set("endDate", filters.endDate);
  try {
    const response = await fetch(
      `${LOAN_API_URL}/late-installments?${params.toString()}`,
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

export const callGetLoanCustomers = async () => {
  try {
    const response = await fetch(`${LOAN_API_URL}/loan-customers`, {
      method: "GET",
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

export const callGetLoansByAccountId = async (accountId) => {
  try {
    const response = await fetch(`${LOAN_API_URL}/account-loans?accountId=${accountId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",  // If you need cookies to be included
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data.loans;  // Return the loans data
  } catch (error) {
    throw new Error(error.message);
  }
};
export const callGetFilteredLoans = async ({
  startDate,
  endDate,
  minAmount,
  maxAmount,
  loan_state,
  loan_plan,
  showLateOnly
}) => {
  try {
    
    const planMap = {
      "all": null,
      "short loan": 1,
      "housing loan": 2,
    };
    const requestBody = {
      start_date: startDate || null,
      end_date: endDate || null,
      min_ammount: minAmount || null,
      max_ammount: maxAmount || null,
      state: loan_state !== 'all' ? loan_state : null,
      plan_id: planMap[loan_plan] || null,
      is_late_loan: showLateOnly || null,
    };

    const response = await fetch(`${REPORT_API_URL}/loanreports`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",  
      body: JSON.stringify(requestBody), 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch loans');
    }

    return data;  
  } catch (error) {
    console.error('Error fetching filtered loans:', error.message);
    throw new Error(error.message);
  }
};

export const callGetFilteredLoanreports = async ({
  startDate,
  endDate,
  minAmount,
  maxAmount,
  loanState,
  loanPlan,
  showLateOnly,
  time
}) => {
  try {
    
    const requestBody = {
      start_date: startDate || null,
      end_date: endDate || null,
      min_ammount: minAmount || null,
      max_ammount: maxAmount || null,
      state: loanState !== 'all' ? loanState : null,
      plan_id: loanPlan !== 'all' ? loanPlan : null,
      is_late_loan: showLateOnly || null,
      report_frequency: time || 'monthly' 
    };

    
    const response = await fetch(`${REPORT_API_URL}/overall-loan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(requestBody),  
    });

    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch loan report data');
    }

    return data;  
  } catch (error) {
    console.error('Error fetching filtered loan reports:', error.message);
    throw new Error(error.message);
  }
};


export const callGetLateLoanreports = async ({
  startDate,
  endDate,
  minAmount,
  maxAmount,
  loanState,
  loanPlan,
  showLateOnly,
  time
}) => {
  try {
    
    const requestBody = {
      start_date: startDate || null,
      end_date: endDate || null,
      min_ammount: minAmount || null,
      max_ammount: maxAmount || null,
      state: loanState !== 'all' ? loanState : null,
      plan_id: loanPlan !== 'all' ? loanPlan : null,
      is_late_loan: showLateOnly || null,
      report_frequency: time || 'monthly' 
    };

    
    const response = await fetch(`${REPORT_API_URL}/overall-late-loan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(requestBody),  
    });

  
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch loan report data');
    }

    return data; 
  } catch (error) {
    console.error('Error fetching filtered loan reports:', error.message);
    throw new Error(error.message);
  }
};


export const callGetBranchLoanSummary = async () => {
  try {
    const response = await fetch(`${LOAN_API_URL}/branch-loans`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch branch loan summary');
    }

    return data;  
  } catch (error) {
    console.error('Error fetching branch loan summary:', error.message);
    throw new Error(error.message);
  }
};


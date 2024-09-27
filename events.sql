-- Event to reset the withdrawal count to 0 at the start of each month for all accounts.

CREATE EVENT ResetWithdrawalCountMonthly
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-10-01 00:00:00'
DO
  CALL ResetWithdrawalCount();


-- Event to calculate interest for savings accounts at the start of each month.
CREATE EVENT CalculateInterest
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-10-01 00:00:00'  -- Start date and time
DO
BEGIN
   
    UPDATE Customer_Account
    SET balance = balance + (balance * (SELECT interest FROM Saving_Plan WHERE plan_id = Customer_Account.plan_id) / 100)
    WHERE account_type = 'saving' AND balance >= (SELECT minimum_balance FROM Saving_Plan WHERE plan_id = Customer_Account.plan_id);
END;
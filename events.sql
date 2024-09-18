--Event to reset the withdrawal count to 0 at the start of each month for all accounts.

CREATE EVENT ResetWithdrawalCountMonthly
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-10-01 00:00:00'
DO
  CALL ResetWithdrawalCount();
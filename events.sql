-- Event to reset the withdrawal count to 0 at the start of each month for all accounts.

CREATE EVENT ResetWithdrawalCountMonthly
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-10-01 00:00:00'
DO
  CALL ResetWithdrawalCount();

DELIMITER $$

CREATE EVENT InsertDailyAccountBalance
ON SCHEDULE EVERY 1 DAY
STARTS '2024-09-28 23:59:59'
DO
BEGIN
    -- Insert account balances for all 'saving' accounts into Daily_Account_Balance table
    INSERT INTO Daily_Account_Balance (account_id, balance, date)
    SELECT
        ca.account_id,
        ca.balance,
        CURDATE() AS balance_date
    FROM
        Customer_Account ca
    WHERE
        ca.account_type = 'saving';
END $$

-- DROP EVENT CalculateMonthlyInterest;

CREATE EVENT CalculateMonthlyInterest
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-01-01 00:00:00'
DO
BEGIN
    DECLARE avg_balance DECIMAL(12,2);
    DECLARE interest_amount DECIMAL(12,2);
    DECLARE interest_rate DECIMAL(5,2);
    DECLARE account_id INT;
    DECLARE done BOOLEAN DEFAULT FALSE;

    -- Cursor to iterate over each saving account's balance for the current month
    DECLARE account_cursor CURSOR FOR
    SELECT
        dab.account_id AS account_Id,
        AVG(dab.balance) AS avg_balance,
        sp.interest AS interest_rate
    FROM
        Daily_Account_Balance dab
    JOIN
        Customer_Account ca ON dab.account_id = ca.account_id
    JOIN
        Saving_Account sa ON ca.account_id = sa.account_id
    JOIN
        Saving_Plan sp ON sa.plan_id = sp.id
    WHERE
        ca.account_type = 'saving'
        AND MONTH(dab.date) = MONTH(CURRENT_DATE)
        AND YEAR(dab.date) = YEAR(CURRENT_DATE)
    GROUP BY
        dab.account_id;

    -- Handler for cursor end
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Open the cursor
    OPEN account_cursor;

    -- Loop through each account
    account_loop: LOOP
        FETCH account_cursor INTO account_id, avg_balance, interest_rate;
        IF done THEN
            LEAVE account_loop;
        END IF;

        -- Calculate the interest amount
        SET interest_amount = (avg_balance * interest_rate / 100);

        -- Start transaction
        START TRANSACTION;

        -- Update the account balance in Customer_Account
        UPDATE Customer_Account
        SET balance = balance + interest_amount
        WHERE Customer_Account.account_id = account_Id;

        -- Check if the update was successful
        IF ROW_COUNT() > 0 THEN
            -- Insert the interest calculation into the Account_Transaction table
            INSERT INTO Account_Transaction (
                account_id,
                amount,
                trans_timestamp,
                reason,
                trans_type,
                trans_method
            ) VALUES (
                account_id,
                interest_amount,
                NOW(),
                'Monthly interest addition',
                'credit',
                'server'
            );

            -- Commit the transaction
            COMMIT;
        ELSE
            -- Rollback if update failed
            ROLLBACK;
        END IF;
    END LOOP;

    -- Close the cursor
    CLOSE account_cursor;
END $$

DELIMITER ;

-- SELECT * FROM daily_account_balance;
-- SELECT * FROM customer_account JOIN saving_account ON customer_account.account_id = saving_account.account_id;
-- SELECT * FROM account_transaction ORDER BY trans_timestamp DESC;
-- -- Event to calculate interest for savings accounts at the start of each month.(old)
-- CREATE EVENT CalculateInterest
-- ON SCHEDULE EVERY 1 MONTH
-- STARTS '2024-10-01 00:00:00'  -- Start date and time
-- DO
-- BEGIN
   
--     UPDATE Customer_Account
--     SET balance = balance + (balance * (SELECT interest FROM Saving_Plan WHERE plan_id = Customer_Account.plan_id) / 100)
--     WHERE account_type = 'saving' AND balance >= (SELECT minimum_balance FROM Saving_Plan WHERE plan_id = Customer_Account.plan_id);
-- END;
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
    INSERT INTO Daily_Account_Balance (customer_id, account_id, account_number, balance_date, account_balance)
    SELECT
        ca.customer_id,
        ca.account_id,
        ca.account_number,
        CURDATE() AS balance_date,
        ca.balance
    FROM
        Customer_Account ca
    WHERE
        ca.account_type = 'saving';
END $$


-- Create the event to calculate monthly interest
CREATE EVENT CalculateMonthlyInterest
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-09-30 23:59:59'
DO
BEGIN
    DECLARE avg_balance DECIMAL(12,2);
    DECLARE interest_amount DECIMAL(12,2);
    DECLARE interest_rate DECIMAL(5,2);
    DECLARE customer_id INT;
    DECLARE account_id INT;
    -- DECLARE account_number CHAR(12);
    DECLARE done BOOLEAN DEFAULT FALSE;

    -- Cursor to iterate over each saving account
    DECLARE account_cursor CURSOR FOR
    SELECT
        dab.customer_id AS customer_id,
        dab.account_id AS account_id,
        AVG(dab.account_balance) AS avg_balance,
        sp.interest AS interest_rate
    FROM
        Daily_Account_Balance dab
    JOIN
        Customer_Account ca ON dab.account_id = ca.account_id
    JOIN
        Saving_Plan sp ON ca.plan_id = sp.plan_id
    WHERE
        ca.account_type = 'saving'
    GROUP BY
        dab.customer_id, dab.account_id, dab.account_number;

    -- Handler for cursor end
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Open the cursor
    OPEN account_cursor;

    -- Loop through each account
    account_loop: LOOP
        FETCH account_cursor INTO customer_id, account_id, avg_balance, interest_rate;
        IF done THEN
            LEAVE account_loop;
        END IF;

        -- Calculate the interest amount
        SET interest_amount = (avg_balance * interest_rate / 100);

        -- Start transaction
        START TRANSACTION;

        -- Update the account balance
        UPDATE Customer_Account ca
        SET balance = balance + interest_amount
        WHERE ca.account_id = account_id;

        -- Check if the update was successful
        IF ROW_COUNT() > 0 THEN
            -- Insert the interest calculation into Account_Transaction table
            INSERT INTO Account_Transaction (
                accnt,
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
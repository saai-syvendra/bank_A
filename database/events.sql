-- Event to reset the withdrawal count to 0 at the start of each month for all accounts.

-- SELECT * FROM saving_account;
-- DROP EVENT ResetWithdrawalCountMonthly;

-- SELECT * FROM Daily_Account_Balance;

CREATE EVENT ResetWithdrawalCountMonthly
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-10-01 00:00:00'
DO
  CALL ResetWithdrawalCount();


DELIMITER $$

CREATE EVENT InsertDailyAccountBalance
ON SCHEDULE EVERY 1 DAY
STARTS '2024-10-01 23:00:00'
DO
BEGIN
    -- Insert account balances for all 'saving' accounts into Daily_Account_Balance table
    INSERT INTO Daily_Account_Balance (account_id, balance, c_date)
    SELECT
        ca.account_id,
        ca.balance,
        CURDATE() AS c_date
    FROM
        Customer_Account ca
    WHERE
        ca.account_type = 'saving';
END $$

-- DROP EVENT CalculateMonthlyInterest;

CREATE EVENT CalculateMonthlyInterest
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-09-30 23:00:00'
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
        SUM(dab.balance)/DAY(LAST_DAY(CURRENT_DATE())) AS avg_balance,
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
        AND MONTH(dab.c_date) = MONTH(CURRENT_DATE)
        AND YEAR(dab.c_date) = YEAR(CURRENT_DATE)
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

CREATE PROCEDURE DepositFDMonthlyInterest()
BEGIN
    -- Declare variables
    DECLARE v_account_id INT;
    DECLARE v_fd_id INT;
    DECLARE v_starting_date DATE;
    DECLARE v_maturity_date DATE;
    DECLARE v_interest_rate DECIMAL(5, 2);
    DECLARE v_deposit_amount DECIMAL(15, 2);
    DECLARE v_current_date DATE;
    DECLARE v_interest DECIMAL(15, 2);
    DECLARE v_expected_date DATE;
    DECLARE done INT DEFAULT FALSE;

    -- Declare cursor
    DECLARE fd_cursor CURSOR FOR
    SELECT fd.account_id, fd.id, fd.starting_date, fd.maturity_date, fd.amount, p.interest
    FROM FD fd
    LEFT JOIN FD_Plan p ON fd.plan_id = p.id
    WHERE CURDATE() <= Maturity_Date;

    -- Declare continue handler
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
	
    -- Initialize current date
    SET v_current_date = CURDATE();
    
    -- Open cursor
    OPEN fd_cursor;

    -- Loop through cursor
    read_loop: LOOP
        FETCH fd_cursor INTO v_account_id, v_fd_id, v_starting_date, v_maturity_date, v_deposit_amount, v_interest_rate;
        
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Calculate the expected interest deposit date (exactly 1 month from opening date)
        SET v_expected_date = DATE_ADD(v_starting_date, INTERVAL TIMESTAMPDIFF(MONTH, v_starting_date, v_current_date) MONTH);

        -- Check if the current date matches the expected date for interest deposit
        IF v_current_date = v_expected_date AND v_current_date != v_starting_date THEN
            -- Calculate the interest for the current month
            SET v_interest = ROUND(v_deposit_amount * (v_interest_rate / 100) / 12, 2);

            -- Insert transaction for monthly interest
            INSERT INTO Account_Transaction (account_id, amount, trans_timestamp, reason, trans_type, trans_method)
            VALUES (v_account_id, v_interest, CURRENT_TIMESTAMP, CONCAT('Monthly FD Interest for: ', v_fd_id), 'credit', 'server');
            
            -- Update the account balance
            UPDATE Customer_Account
            SET balance = balance + v_interest
            WHERE account_id = v_account_id;
        END IF;
        
        -- If maturity date deposit capital
        IF v_current_date = v_maturity_date THEN
            -- Insert transaction for capital
            INSERT INTO Account_Transaction (account_id, amount, trans_timestamp, reason, trans_type, trans_method)
            VALUES (v_account_id, v_deposit_amount, CURRENT_TIMESTAMP, CONCAT('Captial of FD: ', v_fd_id), 'credit', 'server');
            
            -- Update the account balance
            UPDATE Customer_Account
            SET balance = balance + v_deposit_amount
            WHERE account_id = v_account_id;
        END IF;
        
    END LOOP;

    -- Close cursor
    CLOSE fd_cursor;
END $$

CREATE EVENT DailyFDInterestAndPrincipalEvent
ON SCHEDULE EVERY 1 DAY
STARTS '2024-10-30 23:00:00' DO
BEGIN
    -- Call the procedure to deposit monthly FD interest
    CALL DepositMonthlyFDInterest();
END$$


DELIMITER ;


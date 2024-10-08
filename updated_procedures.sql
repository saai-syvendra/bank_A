
DELIMITER $$

CREATE PROCEDURE CheckSafeDeduction(
    IN accountId INT,
    IN withdrawAmount NUMERIC(12,2),
    OUT isSafe BOOLEAN
)
BEGIN
    DECLARE accountBalance NUMERIC(12,2);
    DECLARE accountType ENUM('saving', 'checking');
    DECLARE minBalance NUMERIC(12,2);
    DECLARE accPlanId INT;

    -- Get the account balance and type from Customer_Account
    SELECT balance, account_type INTO accountBalance, accountType
    FROM Customer_Account
    WHERE account_id = accountId;

    -- If the account is a checking account, no minimum balance requirement
    IF accountType = 'checking' THEN
        IF accountBalance >= withdrawAmount THEN
            SET isSafe = TRUE;
        ELSE
            SET isSafe = FALSE;
        END IF;
    ELSEIF accountType = 'saving' THEN
        -- For saving accounts, get the associated plan_id from Saving_Account
        SELECT plan_id INTO accPlanId
        FROM Saving_Account
        WHERE account_id = accountId;

        -- Retrieve the minimum balance from the Saving_Plan based on plan_id
        SELECT minimum_balance INTO minBalance
        FROM Saving_Plan
        WHERE id = accPlanId;

        -- Check if balance after withdrawal meets the minimum balance requirement
        IF (accountBalance - withdrawAmount) >= minBalance THEN
            SET isSafe = TRUE;
        ELSE
            SET isSafe = FALSE;
        END IF;
    ELSE
        -- If account type is neither checking nor saving, set to unsafe
        SET isSafe = FALSE;
    END IF;
END$$

-- DROP PROCEDURE IF EXISTS DeductMoney;

CREATE PROCEDURE DeductMoney(
    IN p_account_id INT,
    IN p_deduct_amount NUMERIC(12,2),
    IN p_reason VARCHAR(500),
    IN p_method ENUM('atm-cdm','online-transfer','server'),
    OUT p_transaction_id INT
)
BEGIN
    DECLARE v_safe_to_deduct BOOLEAN;
    DECLARE v_current_balance NUMERIC(12,2);

    -- Start a transaction
    START TRANSACTION;

    -- Ensure the deduction amount is positive
    IF p_deduct_amount <= 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Deduction amount must be greater than zero.';
    END IF;

    -- Check if the source account exists
    IF NOT AccountExists(p_account_id) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction failed: Source account not found.';
    END IF;

    -- Use the CheckSafeWithdrawal procedure to verify if withdrawal is safe
    CALL CheckSafeDeduction(p_account_id, p_deduct_amount, v_safe_to_deduct);

    IF v_safe_to_deduct = FALSE THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient balance or not safe to withdraw.';
    END IF;

    -- Fetch account details and lock the row for update
    SELECT balance
    INTO v_current_balance
    FROM Customer_Account
    WHERE account_id = p_account_id
    FOR UPDATE;

    -- Deduct the amount from the account
    UPDATE Customer_Account
    SET balance = balance - p_deduct_amount
    WHERE account_id = p_account_id;

    -- Insert transaction record
    INSERT INTO Account_Transaction (
        account_id, amount, trans_timestamp, reason, trans_type, trans_method
    )
    VALUES (
        p_account_id, p_deduct_amount, CURRENT_TIMESTAMP, p_reason, 'debit', p_method
    );

    -- Capture the last inserted transaction_id
    SET p_transaction_id = LAST_INSERT_ID();

    -- Commit the transaction
    COMMIT;


END$$

CREATE PROCEDURE CreateAccount(
	IN p_branch_code	INT,
    IN p_customer_id	INT,
    IN p_balance		NUMERIC(12,2),
    IN p_account_type	ENUM('saving','checking'),
    IN p_plan_id		INT
)
BEGIN
	DECLARE v_exists BOOLEAN;
    DECLARE v_account_id INT;
    DECLARE v_error_message VARCHAR(255);
    
    -- Error handler to capture error message
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            v_error_message = MESSAGE_TEXT;

        -- Rollback the transaction
        ROLLBACK;

        -- Signal an error with a custom message
        SIGNAL SQLSTATE '45000' 
		SET MESSAGE_TEXT = v_error_message;
    END;
    
    -- Start a transaction
    START TRANSACTION;
    
	IF p_balance <= 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Account balance must be positive.';
    END IF;
    
    -- Check if saving plan exists
    IF p_account_type = 'saving' THEN
		SELECT COUNT(*) > 0 INTO v_exists
		FROM Saving_Plan
		WHERE id = p_plan_id;
		
		IF NOT v_exists THEN
			ROLLBACK;
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Saving plan does not exist.';
		END IF;
    END IF;
    
    -- Check if customer exists
    SELECT COUNT(*) > 0 INTO v_exists
    FROM Customer
    WHERE customer_id = p_customer_id;
    
    IF NOT v_exists THEN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Customer does not exist.';
    END IF;
    
    INSERT INTO Customer_Account (branch_code, customer_id, balance, account_type)
    VALUE (p_branch_code, p_customer_id, p_balance, p_account_type);
    
    SELECT COALESCE(MAX(account_id), 0) INTO v_account_id FROM Customer_Account;
    
    IF v_account_id IS NULL THEN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error creating account';
    END IF;
    
    IF p_account_type = 'saving' THEN
		INSERT INTO Saving_Account (account_id, plan_id)
        VALUE (v_account_id, p_plan_id);
	END IF;
    
    COMMIT;
    
END$$

CREATE PROCEDURE CreateCustomer(
    IN p_email VARCHAR(50),            
    IN p_address VARCHAR(255),
    IN p_mobile CHAR(10), 
    IN p_c_type ENUM('individual', 'organisation'), 
    IN p_nic CHAR(12),                               -- NIC (for individual customers)
    IN p_first_name VARCHAR(50),                     -- First name (for individual customers)
    IN p_last_name VARCHAR(50),                      -- Last name (for individual customers)
    IN p_dob DATE,                                   -- Date of birth (for individual customers)
    IN p_brc CHAR(6),                                -- BRC (for organisation customers)
    IN p_name VARCHAR(50)                            -- Organisation name (for organisation customers)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_hashed_pwd VARCHAR(75);
    DECLARE v_error_message VARCHAR(255);
    
    -- Error handler to capture error message
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            v_error_message = MESSAGE_TEXT;

        -- Rollback the transaction
        ROLLBACK;

        -- Signal an error with a custom message
        SIGNAL SQLSTATE '45000' 
		SET MESSAGE_TEXT = v_error_message;
    END;
    
	SET v_hashed_pwd = '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO';
    -- Start transaction
    START TRANSACTION;

    -- Insert into User_Account
    INSERT INTO User_Account (role, email, address, mobile, hashed_pwd)
    VALUES ('customer', p_email, p_address, p_mobile, v_hashed_pwd);

    -- Get the newly created user_id
    SET v_user_id = LAST_INSERT_ID();

    -- Insert into Customer table
    INSERT INTO Customer (customer_id, c_type)
    VALUES (v_user_id, p_c_type);

    -- Insert into either Individual_Customer or Organisation_Customer based on p_c_type
    IF p_c_type = 'individual' THEN
        INSERT INTO Individual_Customer (customer_id, nic, first_name, last_name, dob)
        VALUES (v_user_id, p_nic, p_first_name, p_last_name, p_dob);
    ELSEIF p_c_type = 'organisation' THEN
        INSERT INTO Organisation_Customer (customer_id, brc, name)
        VALUES (v_user_id, p_brc, p_name);
    END IF;

    -- Commit the transaction
    COMMIT;
    
END $$

CREATE PROCEDURE UpdateCustomer(
    IN p_user_id INT,
    IN p_address VARCHAR(255),
    IN p_mobile CHAR(10),
    IN p_first_name VARCHAR(50),                   -- Updated first name (for individual customers)
    IN p_last_name VARCHAR(50),                    -- Updated last name (for individual customers)
    IN p_name VARCHAR(50)                          -- Updated organisation name (for organisation customers)
)
BEGIN
    DECLARE v_c_type ENUM('individual', 'organisation');
    DECLARE v_error_message VARCHAR(255);
    
    -- Error handler to capture error message
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            v_error_message = MESSAGE_TEXT;

        -- Rollback the transaction
        ROLLBACK;

        -- Signal an error with a custom message
        SIGNAL SQLSTATE '45000' 
		SET MESSAGE_TEXT = v_error_message;
    END;

    -- Start transaction
    START TRANSACTION;

    -- Get the customer type
    SELECT c_type INTO v_c_type FROM Customer WHERE customer_id = p_user_id;

    -- Update User_Account
    UPDATE User_Account 
    SET address = p_address, mobile = p_mobile 
    WHERE user_id = p_user_id;

    -- Update either Individual_Customer or Organisation_Customer based on v_c_type
    IF v_c_type = 'individual' THEN
        UPDATE Individual_Customer 
        SET first_name = p_first_name, last_name = p_last_name 
        WHERE customer_id = p_user_id;
    ELSEIF v_c_type = 'organisation' THEN
        UPDATE Organisation_Customer 
        SET name = p_name 
        WHERE customer_id = p_user_id;
    END IF;

    -- Commit the transaction
    COMMIT;
    
END $$

CREATE PROCEDURE UpdateEmployee(
    IN p_emp_id INT,
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
	IN p_mobile CHAR(10),
    IN p_address VARCHAR(255), 
    IN p_experience VARCHAR(255)
)
BEGIN
    DECLARE v_error_message VARCHAR(255);
    
    -- Error handler to capture error message
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            v_error_message = MESSAGE_TEXT;

        -- Rollback the transaction
        ROLLBACK;

        -- Signal an error with a custom message
        SIGNAL SQLSTATE '45000' 
		SET MESSAGE_TEXT = v_error_message;
    END;

    -- Start transaction
    START TRANSACTION;
    
    -- Update User_Account
    UPDATE User_Account 
    SET address = p_address, mobile = p_mobile 
    WHERE user_id = p_emp_id;
    
    -- Update Employee table
    UPDATE Employee 
    SET 
        first_name = p_first_name,
        last_name = p_last_name,
        experience = p_experience
    WHERE emp_id = p_emp_id;

    -- Commit the transaction
    COMMIT;

END $$


CREATE PROCEDURE GetTransactionsFiltered(
    IN p_cust_id INT,                        -- Customer ID (can be NULL)
    IN p_branch_code INT,                    -- Branch code (can be NULL)
    IN p_account_id INT,                     -- Specific account ID
    IN p_start_date DATE,                    -- Filter transactions after this date
    IN p_transaction_type ENUM('credit', 'debit'),  -- Filter by credit or debit transactions
    IN p_min_amount NUMERIC(10,2),           -- Minimum transaction amount
    IN p_max_amount NUMERIC(10,2),           -- Maximum transaction amount
    IN p_method ENUM('atm-cdm', 'online-transfer', 'server', 'via_employee') -- Transaction method filter
)
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE acc_id INT;
    
    -- Cursor to retrieve account_ids either by customer or branch
    DECLARE acc_cursor CURSOR FOR 
        SELECT account_id 
        FROM Customer_Account 
        WHERE (p_account_id IS NOT NULL AND account_id = p_account_id)  -- Filter by account_id if given
        OR (p_account_id IS NULL AND ((p_cust_id IS NOT NULL AND customer_id = p_cust_id) -- Filter by customer_id if given
        OR (p_branch_code IS NOT NULL AND branch_code = p_branch_code))); -- Filter by branch_code if given
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    -- Start transaction
    START TRANSACTION;
    
    -- Declare a temporary table to store transactions
    CREATE TEMPORARY TABLE IF NOT EXISTS TempTransactions (
        transaction_id INT,
        account_id INT,
        account_number CHAR(12),
        amount NUMERIC(10,2),
        trans_timestamp TIMESTAMP,
        reason VARCHAR(500),
        trans_type ENUM('credit', 'debit'),
        trans_method ENUM('atm-cdm', 'online-transfer', 'server', 'via_employee')
    );
    
    -- Open the cursor to iterate over account_ids based on customer_id or branch_code
    OPEN acc_cursor;

    -- Loop through each account
    read_loop: LOOP
        FETCH acc_cursor INTO acc_id;

        -- If no more rows, exit the loop
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Insert the transactions for the current account into the temporary table
        INSERT INTO TempTransactions (transaction_id, account_id, account_number, amount, trans_timestamp, reason, trans_type, trans_method)
        SELECT 
            at.transaction_id, 
            ca.account_id,
            ca.account_number,
            at.amount, 
            at.trans_timestamp, 
            at.reason, 
            at.trans_type, 
            at.trans_method
        FROM 
            Account_Transaction at
        JOIN 
            Customer_Account ca ON at.account_id = ca.account_id
        WHERE 
            ca.account_id = acc_id
        -- Apply the filters only if the parameters are NOT NULL or within range
        AND (p_start_date IS NULL OR at.trans_timestamp >= p_start_date)              
        AND (p_transaction_type IS NULL OR at.trans_type = p_transaction_type)       
        -- Apply the amount filter depending on whether min or max is provided
        AND (
            (p_min_amount IS NULL AND p_max_amount IS NULL)        -- No amount filter
            OR (p_min_amount IS NOT NULL AND p_max_amount IS NULL AND at.amount >= p_min_amount) -- Only min_amount is provided
            OR (p_min_amount IS NULL AND p_max_amount IS NOT NULL AND at.amount <= p_max_amount) -- Only max_amount is provided
            OR (p_min_amount IS NOT NULL AND p_max_amount IS NOT NULL AND at.amount BETWEEN p_min_amount AND p_max_amount) -- Both min and max are provided
        )
        AND (p_method IS NULL OR at.trans_method = p_method);       -- Filter by method if provided
            
		-- Insert the transactions from Online_Transfer, modifying account_id and trans_type as needed
        INSERT INTO TempTransactions (transaction_id, account_id, account_number, amount, trans_timestamp, reason, trans_type, trans_method)
        SELECT 
            at.transaction_id,
            ot.to_account_id AS account_id,
            ca_to.account_number,
            at.amount,
            at.trans_timestamp,
            at.reason,
            'debit' AS trans_type,
            'online-transfer' AS trans_method
        FROM 
            Account_Transaction at
        JOIN 
            Online_Transfer ot ON at.transaction_id = ot.transaction_id
        JOIN 
            Customer_Account ca_to ON ot.to_account_id = ca_to.account_id
        WHERE 
            ot.to_account_id = acc_id
        -- Apply the same filters for Online_Transfer transactions
        AND (p_start_date IS NULL OR at.trans_timestamp >= p_start_date)
        AND (p_transaction_type IS NULL OR CASE WHEN at.trans_type = 'credit' THEN 'debit' ELSE at.trans_type END = p_transaction_type)
        AND (
            (p_min_amount IS NULL AND p_max_amount IS NULL)
            OR (p_min_amount IS NOT NULL AND p_max_amount IS NULL AND at.amount >= p_min_amount)
            OR (p_min_amount IS NULL AND p_max_amount IS NOT NULL AND at.amount <= p_max_amount)
            OR (p_min_amount IS NOT NULL AND p_max_amount IS NOT NULL AND at.amount BETWEEN p_min_amount AND p_max_amount)
        )
        AND (p_method IS NULL OR at.trans_method = p_method);

    END LOOP;

    -- Close the cursor
    CLOSE acc_cursor;

    -- Select all transactions from the temporary table
    SELECT * FROM TempTransactions ORDER BY trans_timestamp DESC;

    -- Clean up the temporary table
    DROP TEMPORARY TABLE IF EXISTS TempTransactions;

    -- Commit the transaction
    COMMIT;
    
END $$

DELIMITER ;


-- SHOW PROCEDURE STATUS  WHERE Db = 'bank_database';

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
        SET MESSAGE_TEXT = 'Transaction failed: Source account not found or not active';
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

-- DROP PROCEDURE WithdrawMoney;

CREATE PROCEDURE WithdrawMoney(
    IN p_account_id INT,
    IN p_withdraw_amount NUMERIC(12,2),
    OUT p_transaction_id INT
)
BEGIN
    DECLARE account_num CHAR(12);
    DECLARE v_withdrawal_count INT;
    DECLARE v_account_type ENUM('saving','checking');
    DECLARE error_message VARCHAR(255);

    -- Start a transaction
    START TRANSACTION;

    -- Check if the source account exists
    IF NOT AccountExists(p_account_id) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction failed: Account does not exist or not active';
    END IF;

    -- Fetch account details: account number, type, and withdrawal count (if it's a saving account)
    SELECT CA.account_number, CA.account_type, IFNULL(SA.withdrawal_count, 0)
    INTO account_num, v_account_type, v_withdrawal_count
    FROM Customer_Account CA
    LEFT JOIN Saving_Account SA ON CA.account_id = SA.account_id
    WHERE CA.account_id = p_account_id
    FOR UPDATE;  -- Lock the account for update


    -- Check for withdrawal limit on savings accounts (5 withdrawals per month in this example)
    IF v_account_type = 'saving' AND v_withdrawal_count >= 5 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Withdrawal limit exceeded for savings account (5 withdrawals per month).';
    ELSEIF v_account_type = 'saving' THEN
        -- Increment withdrawal count for savings accounts
        UPDATE Saving_Account
        SET withdrawal_count = withdrawal_count + 1
        WHERE account_id = p_account_id;
    END IF;

    -- Call the DeductMoney procedure to deduct the amount from the account
    CALL DeductMoney(p_account_id, p_withdraw_amount, CONCAT('ATM Withdrawal at ', CURRENT_TIMESTAMP, ' from account ', account_num), 'atm-cdm', p_transaction_id);

    -- Check if DeductMoney succeeded
    IF p_transaction_id IS NULL THEN
        -- DeductMoney failed, set error message
        SET error_message = CONCAT('Withdrawal from account number ', account_num, ' failed.');
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = error_message;
    ELSE
        -- DeductMoney succeeded, commit the transaction
        COMMIT;
    END IF;

END$$

-- DROP PROCEDURE IF EXISTS DepositMoney;

CREATE PROCEDURE DepositMoney (
    IN p_account_id INT,
    IN p_amount NUMERIC(10,2),
    IN p_reason VARCHAR(500),
    IN p_method ENUM('atm-cdm','online-transfer','server','via_employee'),
    OUT p_transaction_id INT
)
BEGIN
    DECLARE v_current_balance NUMERIC(12,2);

    -- Start a transaction
    START TRANSACTION;

    -- Check if the destination account exists
    IF NOT AccountExists(p_account_id) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction failed: Destination account not found or is inactive';
    END IF;

    -- Get the current balance
    SELECT balance INTO v_current_balance
    FROM Customer_Account
    WHERE account_id = p_account_id
    FOR UPDATE;

    -- Check if the deposit amount is valid
    IF p_amount <= 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Deposit amount must be greater than zero.';
    END IF;

    -- Update the account balance
    UPDATE Customer_Account
    SET balance = balance + p_amount
    WHERE account_id = p_account_id;

    -- Insert the transaction into the Account_Transaction table
    INSERT INTO Account_Transaction (account_id, amount, trans_timestamp, reason, trans_type, trans_method)
    VALUES (p_account_id, p_amount, CURRENT_TIMESTAMP, p_reason, 'credit', p_method);

    -- Commit the transaction
    COMMIT;

    -- Capture the last inserted transaction_id
    SET p_transaction_id = LAST_INSERT_ID();

END $$

CREATE PROCEDURE TransferMoney (
    IN p_from_account_id INT,
    IN p_to_account_id INT,
    IN p_transfer_amount NUMERIC(10,2),
    IN p_reason VARCHAR(500),
    OUT p_transaction_id INT
)
BEGIN
    DECLARE v_from_balance NUMERIC(12,2);
    DECLARE v_safe_to_deduct BOOLEAN;

    -- Start a transaction
    START TRANSACTION;

    -- Check if the transfer amount is positive
    IF p_transfer_amount <= 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transfer amount must be greater than zero.';
    END IF;

    -- Check if the source account exists and is active
    IF NOT AccountExists(p_from_account_id) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transfer failed: Source account not found or inactive.';
    END IF;

    -- Check if the destination account exists and is active
    IF NOT AccountExists(p_to_account_id) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transfer failed: Destination account not found or inactive.';
    END IF;

    -- Fetch the balance of the source account
    SELECT balance
    INTO v_from_balance
    FROM Customer_Account
    WHERE account_id = p_from_account_id
    FOR UPDATE;

    -- Check if the source account is safe to deduct the amount
    CALL CheckSafeDeduction(p_from_account_id, p_transfer_amount, v_safe_to_deduct);

    IF v_safe_to_deduct = FALSE THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transfer failed: Insufficient funds or not safe to withdraw from the source account.';
    END IF;

    -- Deduct amount from the source account
    UPDATE Customer_Account
    SET balance = v_from_balance - p_transfer_amount
    WHERE account_id = p_from_account_id;

    -- Insert the transaction into the Account_Transaction table (only for the from account)
    INSERT INTO Account_Transaction (account_id, amount, trans_timestamp, reason, trans_type, trans_method)
    VALUES (p_from_account_id, p_transfer_amount, CURRENT_TIMESTAMP,
            CONCAT('Transfer to account ', p_to_account_id, ': ', p_reason, ' from account ', p_from_account_id), 'debit', 'online-transfer');

    -- Capture the last inserted transaction_id
    SET p_transaction_id = LAST_INSERT_ID();

    -- Insert into the Online_Transfer table for the to_account details
    INSERT INTO Online_Transfer (transaction_id, to_account_id)
    VALUES (p_transaction_id, p_to_account_id);

    -- Commit the transaction if everything is successful
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

CREATE PROCEDURE CreateFd (
	IN p_plan_id		INT,
    IN p_account_id		INT,
    IN p_amount			NUMERIC(10,2)
) 
BEGIN
	DECLARE v_plan_exists BOOLEAN;
    DECLARE v_safe_to_deduct BOOLEAN;
    DECLARE v_fd_id INT;
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

	START TRANSACTION;
    
    -- Check if the transfer amount is positive
    IF p_amount <= 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FD amount must be greater than zero.';
    END IF;

    -- Check if the source account exists and get its details
    IF NOT AccountExists(p_account_id) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FD creation failed: Account not found.';
    END IF;
    
    SELECT COUNT(*) > 0 INTO v_plan_exists
    FROM FD_Plan
    WHERE id = p_plan_id AND availability = 1;
    
    IF NOT v_plan_exists THEN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FD plan not available.';
    END IF;
    
    CALL CheckSafeDeduction(p_account_id, p_amount, v_safe_to_deduct);
    
    IF v_safe_to_deduct = FALSE THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient funds to create FD.';
    END IF;
	
    INSERT INTO FD (plan_id, account_id, starting_date, amount) VALUES
    (p_plan_id, p_account_id, CURDATE(), p_amount);
    
    SET v_fd_id = LAST_INSERT_ID();
    
    CALL DeductMoney(p_account_id, p_amount, CONCAT('Opened new FD - #', v_fd_id), 'server', @transaction_id);
    
    COMMIT;

END$$

CREATE PROCEDURE CreateLoanInstallments(
    IN p_loan_id INT
)
BEGIN
    DECLARE v_plan_id INT;
    DECLARE v_loan_amount NUMERIC(10,2);
    DECLARE v_months INT;
    DECLARE v_interest DECIMAL(5, 2);
    DECLARE v_approved_date DATE;
    DECLARE v_installment_amount NUMERIC(10,2);
    DECLARE v_state ENUM('online', 'pending', 'approved', 'disapproved');
    DECLARE v_due_date DATE;
    DECLARE v_installment_no INT DEFAULT 1;
    DECLARE v_updated_installment INT;

    -- Get loan details
    SELECT plan_id, loan_amount, start_date 
    INTO v_plan_id, v_loan_amount, v_approved_date
    FROM Loan
    WHERE id = p_loan_id;
	
    IF v_approved_date IS NULL THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = "Loan hasn\'t been approved yet.";
	END IF;
    
	-- To check if installments are already updated
	SELECT COUNT(*)
	INTO v_updated_installment
	FROM Loan_Installment
	WHERE loan_id = p_loan_id;
	
	IF v_updated_installment > 0 THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Loan Installments are already created.';
	END IF;
    
	-- Get loan type details
	SELECT months, interest
	INTO v_months, v_interest
	FROM Loan_Plan
	WHERE id = v_plan_id;

	-- Calculate installment amount
	SET v_installment_amount = ROUND((v_loan_amount + (v_loan_amount * v_interest / 100)) / v_months, 2);

	-- Generate loan installments
	WHILE v_installment_no <= v_months DO
		SET v_due_date = DATE_ADD(v_approved_date, INTERVAL v_installment_no MONTH);

		INSERT INTO Loan_Installment (loan_id, installment_no, installment_amount, due_date, state)
		VALUES (p_loan_id, v_installment_no, v_installment_amount, v_due_date, 'pending');

		SET v_installment_no = v_installment_no + 1;
	END WHILE;
    
END $$

CREATE PROCEDURE CreateOnlineLoan (
    IN p_customer_id INT,
    IN p_loan_plan_id INT,
    IN p_fd_id INT,
    IN p_req_loan_amount NUMERIC(10, 2),
    IN p_connected_account INT
)
BEGIN
    DECLARE v_fd_amount NUMERIC(10,2);
    DECLARE v_max_allowed_loan NUMERIC(10, 2);
    DECLARE v_plan_max_amount NUMERIC(10, 2);
    DECLARE v_new_loan_id INT;
    DECLARE v_error_msg VARCHAR(200);
    DECLARE v_branch_code INT;
    
    -- Error handler to capture error message
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            v_error_msg = MESSAGE_TEXT;

        -- Rollback the transaction
        ROLLBACK;

        -- Signal an error with a custom message
        SIGNAL SQLSTATE '45000' 
		SET MESSAGE_TEXT = v_error_msg;
    END;
    
    -- Start a transaction
    START TRANSACTION;

    -- Check if the FD exists for the customer
    SELECT amount INTO v_fd_amount
    FROM FD LEFT JOIN Customer_Account ca USING(account_id)
    WHERE id = p_fd_id AND ca.customer_id = p_customer_id;

    IF v_fd_amount IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'FD not found for the given customer.';
    END IF;

    -- Calculate the maximum allowable loan amount (60% of the FD amount, capped at 500,000)
    SET v_max_allowed_loan = LEAST(v_fd_amount * 0.60, 500000);

    -- Check if the requested loan amount exceeds the allowable loan limit
    IF p_req_loan_amount > v_max_allowed_loan THEN
        -- Rollback the transaction if requested loan exceeds limits
        SET v_error_msg = CONCAT('Requested loan amount exceeds the allowable loan limit of ', v_max_allowed_loan ,' based on FD.');
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = v_error_msg;
    END IF;

    -- Check if the requested loan amount is less than the maximum allowed amount in the loan plan
    SELECT max_amount INTO v_plan_max_amount
    FROM Loan_Plan
    WHERE id = p_loan_plan_id;

    IF p_req_loan_amount > v_plan_max_amount THEN
        -- Rollback the transaction if loan amount exceeds plan limit
        SET v_error_msg = CONCAT('Requested loan amount exceeds the maximum allowed amount of ', v_plan_max_amount ,' in the plan.');
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- Get branch code
    SELECT branch_code INTO v_branch_code
    FROM Customer_Account
    WHERE account_id = p_connected_account;
    
    -- If all checks pass, insert the loan application
    INSERT INTO Loan (plan_id, connected_account, loan_type, loan_amount, start_date)
    VALUES (p_loan_plan_id, p_connected_account, 'online', p_req_loan_amount, CURDATE());
    
    SET v_new_loan_id = LAST_INSERT_ID();
    
    INSERT INTO Online_Loan (loan_id, fd_id) VALUE (v_new_loan_id, p_fd_id);
    
    CALL DepositMoney (p_connected_account, p_req_loan_amount, CONCAT('Loan Deposit for Loan: #', v_new_loan_id), 'server', @transaction_id);
    
    CALL CreateLoanInstallments(v_new_loan_id);
    
    COMMIT;

END $$

CREATE PROCEDURE CreateBranchLoan (
    IN p_customer_id INT,
    IN p_loan_plan_id INT,
    IN p_req_loan_amount NUMERIC(10, 2),
    IN p_connected_account INT,
    IN p_reason	 VARCHAR(100)
)
BEGIN
    DECLARE v_plan_max_amount NUMERIC(10, 2);
    DECLARE v_new_loan_id INT;
    DECLARE v_error_msg VARCHAR(200);
    DECLARE v_branch_code INT;
    
    -- Error handler to capture error message
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            v_error_msg = MESSAGE_TEXT;

        -- Rollback the transaction
        ROLLBACK;

        -- Signal an error with a custom message
        SIGNAL SQLSTATE '45000' 
		SET MESSAGE_TEXT = v_error_msg;
    END;
    
    -- Start a transaction
    START TRANSACTION;

    -- Check if the requested loan amount is less than the maximum allowed amount in the loan plan
    SELECT max_amount INTO v_plan_max_amount
    FROM Loan_Plan
    WHERE id = p_loan_plan_id;

    IF p_req_loan_amount > v_plan_max_amount THEN
        -- Rollback the transaction if loan amount exceeds plan limit
        SET v_error_msg = CONCAT('Requested loan amount exceeds the maximum allowed amount of ', v_plan_max_amount ,' in the plan.');
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- Get branch code
    SELECT branch_code INTO v_branch_code
    FROM Customer_Account
    WHERE account_id = p_connected_account;
    
    -- If all checks pass, insert the loan application
    INSERT INTO Loan (plan_id, connected_account, loan_type, loan_amount, start_date)
    VALUES (p_loan_plan_id, p_connected_account, 'branch', p_req_loan_amount, CURDATE());
    
    SET v_new_loan_id = LAST_INSERT_ID();
    
    INSERT INTO Branch_Loan (loan_id, request_date, reason) 
    VALUE (v_new_loan_id, CURDATE(), p_reason);
    
    COMMIT;

END $$

CREATE PROCEDURE ApproveLoan (
	IN p_loan_id INT
)
BEGIN
	DECLARE v_loan_exists BOOLEAN;
    DECLARE v_connected_account INT;
    DECLARE v_loan_amount NUMERIC(10,2);
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
    
    START TRANSACTION;
    
    SELECT COUNT(*) > 0 INTO v_loan_exists
    FROM Branch_Loan
    WHERE loan_id = p_loan_id AND NOT state = 'approved';
    
    IF NOT v_loan_exists THEN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Loan does not exist/already approved';
    END IF;
    
    SELECT connected_account, loan_amount
    INTO v_connected_account, v_loan_amount
    FROM Loan
    WHERE id = p_loan_id;
    
    UPDATE Branch_Loan
	SET state = "approved"
	WHERE loan_id = p_loan_id;
    
    UPDATE Loan
    SET start_date = CURDATE()
    WHERE id = p_loan_id;
    
    CALL DepositMoney (v_connected_account, v_loan_amount, CONCAT('Loan Deposit for Loan: #', p_loan_id), 'server', @transaction_id);
    
    CALL CreateLoanInstallments(p_loan_id);
    
    COMMIT;
    
END$$

CREATE PROCEDURE PayInstallment(
	IN p_loan_id			INT,
	IN p_installment_no 	INT,
    IN p_payment_accnt_id	INT
) BEGIN
	DECLARE v_installment_exist		BOOLEAN;
	DECLARE transaction_id 			INT;
    DECLARE v_state          		ENUM('pending','paid','late');
    DECLARE v_installment_amount 	NUMERIC(10,2);
    DECLARE v_due_date				DATE;
    DECLARE v_months				INT;
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
    
    START TRANSACTION;
    
    SELECT COUNT(*) > 0 INTO v_installment_exist
    FROM Loan_Installment
    WHERE loan_id = p_loan_id;
    
    IF NOT v_installment_exist THEN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Loan Installment not found';
    END IF;
    
    SELECT installment_amount, due_date, state
    INTO v_installment_amount, v_due_date, v_state
    FROM Loan_Installment
    WHERE loan_id = p_loan_id AND installment_no=p_installment_no;
    
    IF NOT v_state = 'pending' THEN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Loan Installment has already been paid';
    END IF;
    
    SELECT months INTO v_months
    FROM Loan l
    LEFT JOIN Loan_Plan lp ON l.plan_id = lp.id
    WHERE l.id = p_loan_id;
    
    CALL DeductMoney(p_payment_accnt_id, v_installment_amount, CONCAT('Payment for Loan #', p_loan_id, ' - Installment ', p_installment_no , '/', v_months), 'server', transaction_id);
    
    IF v_due_date < CURDATE() THEN
		SET v_state = 'late';
	ELSE
		SET v_state = 'paid';
	END IF;
    
    UPDATE Loan_Installment
    SET state = v_state, paid_date=CURDATE()
    WHERE loan_id=p_loan_id AND installment_no=p_installment_no;
    
    COMMIT;

END$$

CREATE PROCEDURE GetLateLoanInstallments(
    IN p_branch_code INT,
    IN p_min_amount NUMERIC(10,2),  
    IN p_max_amount NUMERIC(10,2),
    IN p_customer_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    -- Query to select late loan installments based on the filters
    SELECT 
        li.loan_id,
        li.installment_no,
        li.installment_amount,
        li.due_date,
        li.paid_date,
        ca.customer_id,
        lp.months
    FROM 
        Loan_Installment li
    LEFT JOIN 
        Loan l ON li.loan_id = l.id
	LEFT JOIN
		Loan_Plan lp ON l.plan_id=lp.id
	LEFT JOIN
		Customer_Account ca ON l.connected_account=ca.account_id
    WHERE 
        li.state = 'late'
        AND ca.branch_code = p_branch_code
        AND (p_min_amount IS NULL OR li.installment_amount >= p_min_amount)
        AND (p_max_amount IS NULL OR li.installment_amount <= p_max_amount)
        AND (p_customer_id IS NULL OR ca.customer_id = p_customer_id)
        AND (p_start_date IS NULL OR li.due_date >= p_start_date)
        AND (p_end_date IS NULL OR li.due_date <= p_end_date);
END$$

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

CREATE PROCEDURE ResetWithdrawalCount()
BEGIN
  -- Reset withdrawal count to 0 for all accounts
  UPDATE saving_account
  SET withdrawal_count = 0;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE createPerson(
    IN nic CHAR(12),
    IN first_name VARCHAR(50),
    IN last_name VARCHAR(50),
    IN mobile CHAR(10),
    IN email VARCHAR(50),
    IN dob DATE,
    IN address VARCHAR(300),
    IN customerId INT
)
BEGIN
    -- Start transaction
    START TRANSACTION;

    -- Insert into the Person table
    INSERT INTO Person (nic, first_name, last_name, mobile, email, dob, address, customer_id)
    VALUES (nic, first_name, last_name, mobile, email, dob, address, customerId);

    -- Commit transaction
    COMMIT;
END$$

CREATE PROCEDURE createOrganisation(
    IN brc CHAR(6),
    IN org_name VARCHAR(50),
    IN address VARCHAR(300),
    IN telephone CHAR(10),
    IN email VARCHAR(50),
    IN customerId INT
)
BEGIN
    -- Start transaction
    START TRANSACTION;

    -- Insert into the Organisation table
    INSERT INTO Organisation (brc, org_name, address, telephone, email, customer_id)
    VALUES (brc, org_name, address, telephone, email, customerId);

    -- Commit transaction
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
    SELECT plan_id, loan_amount, state, approved_date 
    INTO v_plan_id, v_loan_amount,  v_state, v_approved_date
    FROM Loan
    WHERE loan_id = p_loan_id;
	
    IF v_state = 'pending' THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = "Loan hasn\'t been approved yet.";
	END IF;
    
	IF v_state = 'disapproved' THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = "Loan is disapproved";
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
	WHERE plan_id = v_plan_id;

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

-- DROP PROCEDURE CheckSafeWithdrawal;
-- DROP PROCEDURE CheckSafeDeduction;

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

    -- Get the account balance, type, and plan ID
    SELECT balance, account_type, plan_id INTO accountBalance, accountType, accPlanId
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
        -- For saving accounts, check the associated plan's minimum balance
        SELECT minimum_balance INTO minBalance
        FROM saving_plan
        WHERE plan_id = accPlanId;

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

-- DROP PROCEDURE CreateOnlineLoan;
CREATE PROCEDURE CreateOnlineLoan (
    IN customerId INT,
    IN loanPlanId INT,
    IN fdId INT,
    IN requestedLoanAmount NUMERIC(10, 2),
    IN connectedAccount INT
)
BEGIN
    DECLARE fdAmount NUMERIC(10, 2);
    DECLARE maxAllowedLoan NUMERIC(10, 2);
    DECLARE loanPlanMaxAmount NUMERIC(10, 2);
    DECLARE newLoanId INT;
    
    -- Start a transaction
    START TRANSACTION;

    -- Check if the FD exists for the customer
    SELECT amount INTO fdAmount
    FROM FD
    WHERE fd_id = fdId
    FOR UPDATE;

    IF fdAmount IS NULL THEN
        -- Rollback the transaction if no FD found
        ROLLBACK;
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'FD not found for the given customer.';
    END IF;

    -- Calculate the maximum allowable loan amount (60% of the FD amount, capped at 500,000)
    SET maxAllowedLoan = LEAST(fdAmount * 0.60, 500000);

    -- Check if the requested loan amount exceeds the allowable loan limit
    IF requestedLoanAmount > maxAllowedLoan THEN
        -- Rollback the transaction if requested loan exceeds limits
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Requested loan amount exceeds the allowable loan limit based on FD.';
    END IF;

    -- Check if the requested loan amount is less than the maximum allowed amount in the loan plan
    SELECT max_amount INTO loanPlanMaxAmount
    FROM Loan_Plan
    WHERE plan_id = loanPlanId
    FOR UPDATE;

    IF requestedLoanAmount > loanPlanMaxAmount THEN
        -- Rollback the transaction if loan amount exceeds plan limit
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Requested loan amount exceeds the maximum allowed in the loan plan.';
    END IF;
    
    -- If all checks pass, insert the loan application
    INSERT INTO Loan (plan_id, customer_id, connected_account, request_date, loan_amount, state, fd_id, approved_date)
    VALUES (loanPlanId, customerId, connectedAccount, CURDATE(), requestedLoanAmount, 'online', fdId, CURDATE());
    
    SET newLoanId = LAST_INSERT_ID();
    
    INSERT INTO Account_Transaction (accnt, amount, trans_timestamp, reason, trans_type, trans_method) VALUES
	(connectedAccount, requestedLoanAmount, CURRENT_TIMESTAMP, 'Loan Deposit', 'credit', 'server');
    
    UPDATE Customer_Account
	SET balance = balance + requestedLoanAmount
	WHERE account_id = connectedAccount;
    
    CALL CreateLoanInstallments(newLoanId);
    
    COMMIT;

END $$

-- Procedure to reset the withdrawal count to 0
CREATE PROCEDURE ResetWithdrawalCount()
BEGIN
  -- Reset withdrawal count to 0 for all accounts
  UPDATE customer_account
  SET withdrawal_count = 0;
END $$

DELIMITER;

-- DROP PROCEDURE OF EXISTS DepositMoney;
-- DROP PROCEDURE IF EXISTS DeductMoney;
-- DROP PROCEDURE IF EXISTS WithdrawMoney;
-- DROP PROCEDURE IF EXISTS TransferMoney;


DELIMITER $$

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
        SET MESSAGE_TEXT = 'Transaction failed: Destination account not found.';
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
    INSERT INTO Account_Transaction (accnt, amount, trans_timestamp, reason, trans_type, trans_method)
    VALUES (p_account_id, p_amount, CURRENT_TIMESTAMP, p_reason, 'credit', p_method);

    -- Commit the transaction
    COMMIT;

    -- Capture the last inserted transaction_id
    SET p_transaction_id = LAST_INSERT_ID();

END $$

DELIMITER ;

DELIMITER $$

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
        accnt, amount, trans_timestamp, reason, trans_type, trans_method
    )
    VALUES (
        p_account_id, p_deduct_amount, CURRENT_TIMESTAMP, p_reason, 'debit', p_method
    );

    -- Capture the last inserted transaction_id
    SET p_transaction_id = LAST_INSERT_ID();

    -- Commit the transaction
    COMMIT;


END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE WithdrawMoney(
    IN p_account_id INT,
    IN p_withdraw_amount NUMERIC(12,2),
    OUT p_transaction_id INT
)
BEGIN

    DECLARE account_num CHAR(12);
    DECLARE v_withdrawal_count INT;
    DECLARE v_account_type ENUM('saving','checking');
    DECLARE error_message VARCHAR(255); -- Variable to hold the error message

    -- Start a transaction
    START TRANSACTION;

    -- Check if the source account exists
    IF NOT AccountExists(p_account_id) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction failed: Source account not found.';
    END IF;

    -- Check if the account number is valid, and add the account number to reason
    SELECT account_number, account_type, withdrawal_count
    INTO account_num, v_account_type, v_withdrawal_count
    FROM Customer_Account
    WHERE account_id = p_account_id;

    -- Check for withdrawal limit on savings accounts
    IF v_account_type = 'saving' AND v_withdrawal_count >= 5 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Withdrawal limit exceeded for savings account (5 Withdrawals per month).';
    ELSE
        -- Increment withdrawal count
        UPDATE Customer_Account
        SET withdrawal_count = withdrawal_count + 1
        WHERE account_id = p_account_id;
    END IF;

    -- Call DeductMoney with 'ATM Withdrawal' as the reason
    CALL DeductMoney(p_account_id, p_withdraw_amount, CONCAT('ATM Withdrawal at ', CURRENT_TIMESTAMP, ' from account ', account_num), 'atm-cdm', p_transaction_id);

    -- If DeductMoney fails, signal an error
    IF p_transaction_id IS NULL THEN
        -- Assign the error message to the variable
        SET error_message = CONCAT('Withdrawal from account number ', account_num, ' failed.');
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = error_message;
    ELSE
        -- Commit the transaction if everything is successful
        COMMIT;
    END IF;

END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE TransferMoney (
    IN p_from_account_id INT,
    IN p_to_account_id INT,
    IN p_transfer_amount NUMERIC(10,2),
    IN p_reason VARCHAR(500),
    OUT p_transaction_ids VARCHAR(255)
)
BEGIN
    DECLARE v_from_balance NUMERIC(12,2);
    DECLARE v_to_balance NUMERIC(12,2);
    DECLARE v_safe_to_deduct BOOLEAN;
    DECLARE v_from_transaction_id INT;
    DECLARE v_to_transaction_id INT;

    -- Start a transaction
    START TRANSACTION;

    -- Check if the transfer amount is positive
    IF p_transfer_amount <= 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transfer amount must be greater than zero.';
    END IF;

    -- Check if the source account exists and get its details
    IF NOT AccountExists(p_from_account_id) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transfer failed: Source account not found.';
    END IF;

    SELECT balance
    INTO v_from_balance
    FROM Customer_Account
    WHERE account_id = p_from_account_id FOR UPDATE;

    -- Check if the destination account exists
    IF NOT AccountExists(p_to_account_id) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transfer failed: Destination account not found.';
    END IF;

    SELECT balance
    INTO v_to_balance
    FROM Customer_Account
    WHERE account_id = p_to_account_id FOR UPDATE;

    -- Check if the source account is safe to deduct the amount
    CALL CheckSafeDeduction(p_from_account_id, p_transfer_amount, v_safe_to_deduct);

    IF v_safe_to_deduct = FALSE THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transfer failed: Insufficient funds or not safe to withdraw from source account.';
    END IF;

    -- Deduct amount from the source account
    UPDATE Customer_Account
    SET balance = v_from_balance - p_transfer_amount
    WHERE account_id = p_from_account_id;

    -- Update the destination account's balance
    UPDATE Customer_Account
    SET balance = v_to_balance + p_transfer_amount
    WHERE account_id = p_to_account_id;

    -- Insert transaction records for both accounts
    INSERT INTO Account_Transaction (accnt, amount, trans_timestamp, reason, trans_type, trans_method)
    VALUES (p_from_account_id, p_transfer_amount, CURRENT_TIMESTAMP,
            CONCAT('Transfer to account ', p_to_account_id, ': ', p_reason), 'debit', 'online-transfer');

    SET v_from_transaction_id = LAST_INSERT_ID(); -- Capture the transaction ID for the source account

    INSERT INTO Account_Transaction (accnt, amount, trans_timestamp, reason, trans_type, trans_method)
    VALUES (p_to_account_id, p_transfer_amount, CURRENT_TIMESTAMP,
            CONCAT('Transfer from account ', p_from_account_id, ': ', p_reason), 'credit', 'online-transfer');

    SET v_to_transaction_id = LAST_INSERT_ID(); -- Capture the transaction ID for the destination account

    -- Commit the transaction if everything is successful
    COMMIT;

     -- Return both transaction IDs as a concatenated string
    SET p_transaction_ids = CONCAT(v_from_transaction_id, ',', v_to_transaction_id);

END$$

DELIMITER ;

DELIMITER $$

-- Procedure to get transactions
CREATE PROCEDURE GetTransactions(
    IN accountNumber CHAR(12)
)
BEGIN
    DECLARE accountID INT;

    -- Start transaction
    START TRANSACTION;
    
	-- Get account id
    SELECT account_id INTO accountID FROM customer_account WHERE account_number = accountNumber;
    
    -- Get all transactions for the account, including from_accnt_number and to_accnt_number
    SELECT 
        at.transaction_id, at.amount, at.trans_timestamp, at.reason, at.trans_type, at.trans_method, customer_account.account_number                
    FROM 
        account_transaction at
    LEFT JOIN 
        customer_account ON customer_account.account_id = at.accnt
    WHERE 
        at.accnt = accountID
    ORDER BY 
        at.trans_timestamp DESC;

    -- Commit transaction
    COMMIT;
END$$
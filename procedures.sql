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

-- Procedure to reset the withdrawal count to 0
CREATE PROCEDURE ResetWithdrawalCount()
BEGIN
  -- Reset withdrawal count to 0 for all accounts
  UPDATE customer_account
  SET withdrawal_count = 0;
END $$

-- DROP PROCEDURE OF EXISTS DepositMoney;
-- DROP PROCEDURE IF EXISTS DeductMoney;
-- DROP PROCEDURE IF EXISTS WithdrawMoney;
-- DROP PROCEDURE IF EXISTS TransferMoney;



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

-- DROP PROCEDURE CreateOnlineLoan$$
CREATE PROCEDURE CreateOnlineLoan (
    IN p_customer_id INT,
    IN p_loan_plan_id INT,
    IN p_fd_id INT,
    IN p_req_loan_amount NUMERIC(10, 2),
    IN p_connected_account INT,
    IN p_reason VARCHAR(100)
)
BEGIN
    DECLARE v_fd_amount NUMERIC(10,2);
    DECLARE v_max_allowed_loan NUMERIC(10, 2);
    DECLARE v_plan_max_amount NUMERIC(10, 2);
    DECLARE v_new_loan_id INT;
    DECLARE v_error_msg VARCHAR(200);
    
    -- Start a transaction
    START TRANSACTION;

    -- Check if the FD exists for the customer
    SELECT amount INTO v_fd_amount
    FROM FD LEFT JOIN Customer_Account ca USING(account_id)
    WHERE fd_id = p_fd_id AND ca.customer_id = p_customer_id;

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
    WHERE plan_id = p_loan_plan_id
    FOR UPDATE;

    IF p_req_loan_amount > v_plan_max_amount THEN
        -- Rollback the transaction if loan amount exceeds plan limit
        SET v_error_msg = CONCAT('Requested loan amount exceeds the maximum allowed amount of ', v_plan_max_amount ,' in the plan.');
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = v_error_msg;
    END IF;
    
    -- If all checks pass, insert the loan application
    INSERT INTO Loan (plan_id, customer_id, connected_account, request_date, loan_amount, state, fd_id, approved_date, reason)
    VALUES (p_loan_plan_id, p_customer_id, p_connected_account, CURDATE(), p_req_loan_amount, 'online', p_fd_id, CURDATE(), p_reason);
    
    SET v_new_loan_id = LAST_INSERT_ID();
    
    CALL DepositMoney (p_connected_account, p_req_loan_amount, CONCAT('Loan Deposit for Loan: #', v_new_loan_id), 'server', @transaction_id);
    
    CALL CreateLoanInstallments(v_new_loan_id);
    
    COMMIT;

END $$

CREATE PROCEDURE ApproveLoan (
	IN p_loan_id INT
)
BEGIN
	DECLARE v_loan_exists BOOLEAN;
    DECLARE v_connected_account INT;
    DECLARE v_loan_amount NUMERIC(10,2);
    
    START TRANSACTION;
    
    SELECT COUNT(*) > 0 INTO v_loan_exists
    FROM Loan
    WHERE loan_id = p_loan_id AND NOT state = 'approved';
    
    IF NOT v_loan_exists THEN
		ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Loan does not exist/already approved';
    END IF;
    
    SELECT connected_account, loan_amount
    INTO v_connected_account, v_loan_amount
    FROM Loan
    WHERE loan_id = p_loan_id;
    
    UPDATE Loan
	SET state = "approved", approved_date = CURDATE()
	WHERE loan_id = p_loan_id;
    
    CALL DepositMoney (v_connected_account, v_loan_amount, CONCAT('Loan Deposit for Loan: #', p_loan_id), 'server', @transaction_id);
    
    CALL CreateLoanInstallments(p_loan_id);
    
    COMMIT;
    
END$$

CREATE PROCEDURE PayInstallment(
	IN p_loan_id			INT,
	IN p_installment_no 	INT,
    IN p_payment_accnt_id	INT
) BEGIN
	DECLARE transaction_id INT;
    DECLARE v_state          		ENUM('pending','paid','late');
    DECLARE v_installment_amount 	NUMERIC(10,2);
    DECLARE v_due_date				DATE;
    DECLARE v_months				INT;
    
    START TRANSACTION;
    
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
    FROM Loan 
    LEFT JOIN Loan_Plan USING(plan_id)
    WHERE loan_id = p_loan_id;
    
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
            Customer_Account ca ON at.accnt = ca.account_id
        WHERE 
            ca.account_id = acc_id
        -- Apply the filters only if the parameters are NOT NULL or within range
        AND (p_start_date IS NULL OR at.trans_timestamp >= p_start_date)               -- Filter by start date if provided
        AND (p_transaction_type IS NULL OR at.trans_type = p_transaction_type)         -- Filter by transaction type if provided
        -- Apply the amount filter depending on whether min or max is provided
        AND (
            (p_min_amount IS NULL AND p_max_amount IS NULL)        -- No amount filter
            OR (p_min_amount IS NOT NULL AND p_max_amount IS NULL AND at.amount >= p_min_amount) -- Only min_amount is provided
            OR (p_min_amount IS NULL AND p_max_amount IS NOT NULL AND at.amount <= p_max_amount) -- Only max_amount is provided
            OR (p_min_amount IS NOT NULL AND p_max_amount IS NOT NULL AND at.amount BETWEEN p_min_amount AND p_max_amount) -- Both min and max are provided
        )
        AND (p_method IS NULL OR at.trans_method = p_method)                           -- Filter by method if provided
        ORDER BY 
            at.trans_timestamp DESC;

    END LOOP;

    -- Close the cursor
    CLOSE acc_cursor;

    -- Select all transactions from the temporary table
    SELECT * FROM TempTransactions;

    -- Clean up the temporary table
    DROP TEMPORARY TABLE IF EXISTS TempTransactions;

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
    WHERE plan_id = p_plan_id AND availability = 'yes';
    
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

-- Loan Reports

DROP PROCEDURE IF EXISTS GetLoanReport;

DELIMITER //

CREATE PROCEDURE GetLoanReport(
    IN start_date DATE,
    IN end_date DATE,
    IN min_ammount DECIMAL(10,2),
    IN max_ammount DECIMAL(10,2),
    IN state ENUM('pending','approved','rejected','online'),
    IN branch INT,
    IN plan_id INT,
    IN is_late_loan BOOL
)
BEGIN
    -- Assign default values if not provided
    IF start_date IS NULL THEN
        SET start_date = '2024-01-01';
    END IF;
    
    IF end_date IS NULL THEN
        SET end_date = CURRENT_DATE;
    END IF;
    
    IF min_ammount IS NULL THEN
        SET min_ammount = 0.00;
    END IF;
    
    IF max_ammount IS NULL THEN
        SET max_ammount = 99999999.00;
    END IF;
    
    IF state IS NULL THEN
        SET state = 'approved';
    END IF;
    
    IF branch IS NULL THEN
        SET branch = NULL;
    END IF;
    
    IF plan_id IS NULL THEN
        SET plan_id = NULL;
    END IF;
    
    IF is_late_loan IS NULL THEN
        SET is_late_loan = FALSE;
    END IF;

    -- Fetch loan report based on loan_installments with late payments
    SELECT loan_view.*
    FROM loan_view
    -- Inner join with loan_installments to filter out late loans
    INNER JOIN loan_installment
        ON loan_view.loan_id = loan_installment.loan_id
    WHERE loan_installment.state = 'late'
    AND (start_date IS NULL OR approved_date >= start_date)
    AND (end_date IS NULL OR approved_date <= end_date)
    AND loan_amount BETWEEN min_ammount AND max_ammount
    AND (state IS NULL OR loan_view.state = state)
    AND (branch IS NULL OR branch_code = branch)
    AND (plan_id IS NULL OR loan_view.plan_id = plan_id)
    -- Filter based on is_late_loan flag
    AND (is_late_loan = TRUE AND loan_installment.state = 'late')
    GROUP BY loan_view.loan_id;  -- Group by loan_id to avoid duplicates

END//
DELIMITER ;


DROP PROCEDURE IF EXISTS GetOverallLoanReport;

DELIMITER //

CREATE PROCEDURE GetOverallLoanReport(
    IN start_date DATE,
    IN end_date DATE,
    IN state ENUM('pending','approved','rejected','online'),
    IN branch_code INT,
    IN report_frequency ENUM('daily', 'weekly', 'monthly')
)
BEGIN
    IF report_frequency = 'daily' THEN
        SELECT DATE(approved_date) AS approved_date,
            COUNT(*) AS loan_count,
            AVG(loan_amount) AS avg_loan_amount,
            MAX(loan_amount) AS max_loan_amount,
            MIN(loan_amount) AS min_loan_amount,
            SUM(loan_amount) AS total_loan_amount
        FROM loan_view
        WHERE (start_date IS NULL OR approved_date >= start_date)
          AND (end_date IS NULL OR approved_date <= end_date)
          AND (state IS NULL OR loan_view.state = state)
          AND (branch_code IS NULL OR loan_view.branch_code = branch_code)
        GROUP BY DATE(approved_date)
        ORDER BY approved_date DESC;
    ELSEIF report_frequency = 'weekly' THEN
        SELECT YEARWEEK(approved_date) AS approved_week,
            COUNT(*) AS loan_count,
            AVG(loan_amount) AS avg_loan_amount,
            MAX(loan_amount) AS max_loan_amount,
            MIN(loan_amount) AS min_loan_amount,
            SUM(loan_amount) AS total_loan_amount,
            COUNT(*) / 7 AS weekly_loan_amount_rate,
            SUM(loan_amount) / 7 AS weekly_loan_amount_amount
        FROM loan_view
        WHERE (start_date IS NULL OR approved_date >= start_date)
          AND (end_date IS NULL OR approved_date <= end_date)
          AND (state IS NULL OR loan_view.state = state)
          AND (branch_code IS NULL OR loan_view.branch_code = branch_code)
        GROUP BY YEARWEEK(approved_date)
        ORDER BY approved_week DESC;
    ELSEIF report_frequency = 'monthly' THEN
        SELECT DATE_FORMAT(approved_date, '%Y-%m') AS approved_month,
            COUNT(*) AS loan_count,
            AVG(loan_amount) AS avg_loan_amount,
            MAX(loan_amount) AS max_loan_amount,
            MIN(loan_amount) AS min_loan_amount,
            SUM(loan_amount) AS total_loan_amount,
            COUNT(*) / (DATEDIFF(LAST_DAY(end_date), start_date) / 30) AS monthly_loan_rate,
            SUM(loan_amount) / (DATEDIFF(LAST_DAY(end_date), start_date) / 30) AS monthly_loan_amount
        FROM loan_view
        WHERE (start_date IS NULL OR approved_date >= start_date)
          AND (end_date IS NULL OR approved_date <= end_date)
          AND (state IS NULL OR loan_view.state = state)
          AND (branch_code IS NULL OR loan_view.branch_code = branch_code)
        GROUP BY DATE_FORMAT(approved_date, '%Y-%m')
        ORDER BY approved_month DESC;
    END IF;
END //

DELIMITER ;

-- Usage example
-- CALL GetOverallLoanReport('2023-01-01', '2023-12-31', 'approved', 1001, 'monthly');

DROP PROCEDURE IF EXISTS GetOverallLateLoanReport;

DELIMITER //

CREATE PROCEDURE GetOverallLateLoanReport(
    IN end_date DATE,
    IN state ENUM('pending','approved','rejected','online'),
    IN branch_code INT,
    IN report_frequency ENUM('daily', 'weekly', 'monthly')
)
BEGIN
    IF report_frequency = 'daily' THEN
        SELECT DATE(due_date) AS due_date,
            COUNT(*) AS installment_count,
            AVG(installment_amount) AS avg_installment_amount,
            MAX(installment_amount) AS max_installment_amount,
            MIN(installment_amount) AS min_installment_amount,
            SUM(installment_amount) AS total_installment_amount
        FROM loan_view
        INNER JOIN loan_installment ON loan_view.loan_id = loan_installment.loan_id
        WHERE (end_date IS NULL OR due_date <= end_date)
          AND (state IS NULL OR loan_view.state = state)
          AND (branch_code IS NULL OR branch_code = branch_code)
        GROUP BY DATE(due_date)
        ORDER BY due_date DESC;
    ELSEIF report_frequency = 'weekly' THEN
        SELECT YEARWEEK(due_date) AS due_week,
            COUNT(*) AS installment_count,
            AVG(installment_amount) AS avg_installment_amount,
            MAX(installment_amount) AS max_installment_amount,
            MIN(installment_amount) AS min_installment_amount,
            SUM(installment_amount) AS total_installment_amount,
            COUNT(*)/7 AS weekly_loan_installment_rate,
            SUM(installment_amount)/7 AS weekly_loan_installment_rate
        FROM loan_view
        INNER JOIN loan_installment ON loan_view.loan_id = loan_installment.loan_id
        WHERE (end_date IS NULL OR due_date <= end_date)
          AND (state IS NULL OR loan_view.state = state)
          AND (branch_code IS NULL OR branch_code = branch_code)
        GROUP BY YEARWEEK(due_date)
        ORDER BY due_week DESC;
    ELSEIF report_frequency = 'monthly' THEN
        SELECT DATE_FORMAT(due_date, '%Y-%m') AS due_month,
            COUNT(*) AS installment_count,
            AVG(installment_amount) AS avg_installment_amount,
            MAX(installment_amount) AS max_installment_amount,
            MIN(installment_amount) AS min_installment_amount,
            SUM(installment_amount) AS total_installment_amount,
            COUNT(*)/30 AS monthly_loan_installment_rate,
            SUM(installment_amount)/30 AS monthly_loan_installment_rate
        FROM loan_view
        INNER JOIN loan_installment ON loan_view.loan_id = loan_installment.loan_id
        WHERE (end_date IS NULL OR due_date <= end_date)
          AND (state IS NULL OR loan_view.state = state)
          AND (branch_code IS NULL OR branch_code = branch_code)
        GROUP BY DATE_FORMAT(due_date, '%Y-%m')
        ORDER BY due_month DESC;
    END IF;
END //

DELIMITER ;

-- Usage example
-- CALL GetOverallLateLoanReport('2023-12-31', 'approved', 1001, 'monthly');

-- Transaction Reports

DROP PROCEDURE IF EXISTS GetTransactionReport;

DELIMITER //

CREATE PROCEDURE GetTransactionReport(
    IN start_date TIMESTAMP,
    IN end_date TIMESTAMP,
    IN max_amount DECIMAL(10,2),
    IN min_amount DECIMAL(10,2),
    IN transaction_type ENUM('credit','debit'),
    IN transaction_method ENUM('atm-cdm','online-transfer','server','via_employee'),
    IN branch_code INT
)
BEGIN
	IF min_amount IS NULL THEN
		SET min_amount = 0;
	END IF;
	IF max_amount IS NULL THEN
		SET max_amount = 99999999.99;
	END IF;
    SELECT * 
    FROM transaction_view
    WHERE (start_date IS NULL OR trans_timestamp >= start_date)
      AND (end_date IS NULL OR trans_timestamp <= end_date)
      AND amount BETWEEN min_amount AND max_amount
      AND (transaction_type IS NULL OR trans_type = transaction_type)
      AND (transaction_method IS NULL OR trans_method = transaction_method)
      AND (branch_code IS NULL OR transaction_view.branch_code = branch_code)
    ORDER BY trans_timestamp DESC;
END //

DELIMITER ;

-- Usage example
-- CALL GetTransactionReport('2023-01-01 00:00:00', '2024-12-31 23:59:59', NULL, NULL, 'credit', NULL, NULL);

DROP PROCEDURE IF EXISTS GetTransactionOverallReport;

DELIMITER //

CREATE PROCEDURE GetTransactionOverallReport(
    IN start_date TIMESTAMP,
    IN end_date TIMESTAMP,
    IN transaction_type ENUM('credit','debit'),
    IN transaction_method ENUM('atm-cdm','online-transfer','server','via_employee'),
    IN branch_code INT,
    IN report_period ENUM('daily', 'weekly', 'monthly')
)
BEGIN
    IF report_period = 'daily' THEN
        SELECT 
            DATE(trans_timestamp) AS transaction_date,
            COUNT(*) AS transaction_count, 
            AVG(amount) AS avg_trans_amount, 
            MIN(amount) AS min_trans_amount, 
            MAX(amount) AS max_trans_amount, 
            SUM(amount) AS total_trans_amount,
            COUNT(*) / DATEDIFF(end_date, start_date) AS transactions_per_day,
            SUM(amount) / DATEDIFF(end_date, start_date) AS transaction_amount_per_day
        FROM transaction_view
        WHERE (start_date IS NULL OR trans_timestamp >= start_date)
          AND (end_date IS NULL OR trans_timestamp <= end_date)
          AND (transaction_type IS NULL OR trans_type = transaction_type)
          AND (transaction_method IS NULL OR trans_method = transaction_method)
          AND (branch_code IS NULL OR transaction_view.branch_code = branch_code)
        GROUP BY transaction_date
        ORDER BY transaction_date DESC;

    ELSEIF report_period = 'weekly' THEN
        SELECT 
            YEARWEEK(trans_timestamp, 1) AS transaction_week,  -- Get week number and year
            COUNT(*) AS transaction_count, 
            AVG(amount) AS avg_trans_amount, 
            MIN(amount) AS min_trans_amount, 
            MAX(amount) AS max_trans_amount, 
            SUM(amount) AS total_trans_amount,
            COUNT(*)/7 AS weekly_loan_installment_rate,
            SUM(amount)/7 AS weekly_loan_installment_rate
        FROM transaction_view
        WHERE (start_date IS NULL OR trans_timestamp >= start_date)
          AND (end_date IS NULL OR trans_timestamp <= end_date)
          AND (transaction_type IS NULL OR trans_type = transaction_type)
          AND (transaction_method IS NULL OR trans_method = transaction_method)
          AND (branch_code IS NULL OR transaction_view.branch_code = branch_code)
        GROUP BY transaction_week
        ORDER BY transaction_week DESC;

    ELSEIF report_period = 'monthly' THEN
        SELECT 
            DATE_FORMAT(trans_timestamp, '%Y-%m') AS transaction_month,  -- Format as YYYY-MM
            COUNT(*) AS transaction_count, 
            AVG(amount) AS avg_trans_amount, 
            MIN(amount) AS min_trans_amount, 
            MAX(amount) AS max_trans_amount, 
            SUM(amount) AS total_trans_amount,
            COUNT(*)/7 AS weekly_loan_installment_rate,
            SUM(amount)/7 AS weekly_loan_installment_rate
        FROM transaction_view
        WHERE (start_date IS NULL OR trans_timestamp >= start_date)
          AND (end_date IS NULL OR trans_timestamp <= end_date)
          AND (transaction_type IS NULL OR trans_type = transaction_type)
          AND (transaction_method IS NULL OR trans_method = transaction_method)
          AND (branch_code IS NULL OR transaction_view.branch_code = branch_code)
        GROUP BY transaction_month
        ORDER BY transaction_month DESC;

    END IF;
END //

DELIMITER ;

-- Usage example for daily report
-- CALL GetTransactionOverallReport('2023-01-01 00:00:00', '2024-12-31 23:59:59', NULL, NULL, NULL, 'daily');

-- Usage example for weekly report
-- CALL GetTransactionOverallReport('2023-01-01 00:00:00', '2024-12-31 23:59:59', NULL, NULL, NULL, 'weekly');

-- Usage example for monthly report
-- CALL GetTransactionOverallReport('2023-01-01 00:00:00', '2024-12-31 23:59:59', NULL, NULL, NULL, 'monthly');
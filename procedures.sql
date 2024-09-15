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
	
	IF v_Updated_Installment > 0 THEN
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
		VALUES (v_plan_id, v_installment_no, v_installment_amount, v_due_date, 'pending');

		SET v_installment_no = v_installment_no + 1;
	END WHILE;
    
END $$

CREATE PROCEDURE CheckSafeWithdrawal(
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
    WHERE account_number = accountNo;

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
        FROM Saving_Plan
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
    INSERT INTO Loan (plan_id, customer_id, connected_account, request_date, loan_amount, state, fd_id)
    VALUES (loanPlanId, customerId, connectedAccount, CURDATE(), requestedLoanAmount, 'online', fdId);
    
    INSERT INTO Account_Transaction (from_accnt, amount, trans_timestamp, reason, trans_type, method) VALUES
	(connectedAccount, requestedLoanAmount, CURRENT_TIMESTAMP, 'Loan Deposit', 'credit', 'server');
    
    UPDATE Customer_Account
	SET balance = balance + requestedLoanAmount
	WHERE account_id = connectedAccount;
    
    COMMIT;

END $$

DELIMITER ;


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

DELIMITER ;

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

DELIMITER ;

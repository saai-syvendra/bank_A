CREATE DATABASE bank_database;
USE bank_database;

-- Create Customer table
CREATE TABLE Customer (
  customer_id INT AUTO_INCREMENT,
  c_type      ENUM('individual','organisation') NOT NULL,
  PRIMARY KEY (customer_id)
)AUTO_INCREMENT = 10000;

-- Create Branch table without FK
CREATE TABLE Branch (
  branch_code   INT AUTO_INCREMENT,
  branch_name   VARCHAR(50) NOT NULL UNIQUE,
  telephone     CHAR(10) NOT NULL,
  manager_id    INT,
  PRIMARY KEY (branch_code)
)AUTO_INCREMENT = 1;

-- Create Employee Table
CREATE TABLE Employee (
  emp_id         INT AUTO_INCREMENT,
  customer_id    INT,
  branch_code    INT,
  position       VARCHAR(50),
  experience     VARCHAR(1000),
  salary         NUMERIC(10,2),
  PRIMARY KEY (emp_id),
  FOREIGN KEY (branch_code) REFERENCES Branch(branch_code),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
) AUTO_INCREMENT = 100;

-- Update the Fk of branch table
ALTER TABLE Branch
ADD CONSTRAINT fk_branch_manager
FOREIGN KEY (manager_id) REFERENCES Employee(emp_id);

-- Create Organization Table
CREATE TABLE Organisation (
  brc               CHAR(6) UNIQUE NOT NULL,
  org_name          VARCHAR(50) NOT NULL,
  address           VARCHAR(300),
  telephone         CHAR(10),
  email             VARCHAR(50) NOT NULL,
  customer_id       INT,
  PRIMARY KEY (customer_id),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

-- Create Person Table
CREATE TABLE Person (
  nic                   CHAR(12) NOT NULL UNIQUE,
  first_name            VARCHAR(50) NOT NULL,
  last_name             VARCHAR(50) NOT NULL,
  mobile                CHAR(10),
  email                 VARCHAR(50) NOT NULL,
  dob                   DATE NOT NULL,
  age                   INT,
  address               VARCHAR(300),
  customer_id           INT,
  PRIMARY KEY (customer_id),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)

);

-- SQL trigger to automatically calculate and add age to the person table
DELIMITER $$

CREATE TRIGGER calculate_age
BEFORE INSERT ON Person
FOR EACH ROW
BEGIN
    -- Calculate age based on the 'dob' column
    SET NEW.age = TIMESTAMPDIFF(YEAR, NEW.dob, CURDATE());
END $$

DELIMITER ;


-- Create User table
CREATE TABLE User_Account (
  username         VARCHAR(100),
  hashed_pwd        VARCHAR(75) NOT NULL,
  customer_id       INT,
  emp_id            INT,
  user_role              ENUM('customer', 'employee', 'manager', 'admin'),
  PRIMARY KEY (username),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
  FOREIGN KEY (emp_id) REFERENCES Employee(emp_id),
  CHECK (
        (user_role = 'customer' AND customer_id IS NOT NULL AND emp_id IS NULL) OR
        (user_role IN ('employee', 'manager') AND emp_id IS NOT NULL AND customer_id IS NULL)
    )

);

-- Create User Logins_Log Table
CREATE TABLE User_login_Log (
  username         VARCHAR(100),
  timestamp         TIMESTAMP,
  status            ENUM('success','failed'),
  PRIMARY KEY (username, timestamp),
  FOREIGN KEY (username) REFERENCES User_Account(username)
);


-- Create Savings Plan Table
CREATE TABLE Saving_Plan (
  plan_id           INT AUTO_INCREMENT,
  plan_name              VARCHAR(50) NOT NULL,
  interest          DECIMAL(4,2) NOT NULL,
  minimum_balance   NUMERIC(12,2),
  availability      ENUM('yes','no') NOT NULL,
  PRIMARY KEY (plan_id)
);

INSERT INTO Saving_Plan (plan_name, interest, minimum_balance, availability) VALUES 
('children', 12.00, 0, 'yes'), 
('teen', 11.00, 500, 'yes'), 
('adult', 10.00, 1000, 'yes'), 
('senior', 13.00, 1000, 'yes');

-- Create Loan Plan Table
CREATE TABLE Loan_Plan (
  plan_id           INT AUTO_INCREMENT,
  plan_name         VARCHAR(50) NOT NULL,
  interest          NUMERIC(4,2),
  plan_type         ENUM('personal','business'),
  max_amount 		NUMERIC(10,2),
  months            INT,
  availability      ENUM('yes','no'),
  PRIMARY KEY (plan_id)
);

INSERT INTO Loan_Plan (plan_name, interest, plan_type, max_amount, months, availability) VALUES
("Short Loan", 19.00, 'personal', 200000, 6, 'yes'), 
("Housing Loan", 17.00, 'business', 10000000.00, 48, 'yes');

-- Create FD plan table
CREATE TABLE FD_Plan (
  plan_id           INT AUTO_INCREMENT,
  plan_name         VARCHAR(50),
  interest          NUMERIC(4,2),
  months            INT,
  availability      enum('yes','no'),
  PRIMARY KEY (plan_id)
);

INSERT INTO FD_Plan (plan_name, interest, months, availability) VALUES 
("Six Month", 13, 6, "yes"),
("One Year", 14, 12, "yes"),
("Three Years", 15, 36, "yes"),
("Expired FD", 18.5, 6, "no");


-- Create Accounts table
CREATE TABLE Customer_Account (
  account_id        INT,
  account_number    CHAR(12) UNIQUE,
  plan_id           INT,
  branch_code       INT NOT NULL,
  customer_id       INT NOT NULL,
  balance           NUMERIC(12,2),
  starting_date     DATE,
  account_type      ENUM('saving','checking'),
  withdrawal_count  INT DEFAULT 0,
  PRIMARY KEY (account_id),
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  FOREIGN KEY (branch_code) REFERENCES Branch(branch_code),
  FOREIGN KEY (plan_id) REFERENCES saving_plan(plan_id)
);

DELIMITER //

CREATE TRIGGER MinBalanceAndAccountNumber
BEFORE INSERT ON Customer_Account
FOR EACH ROW
BEGIN
	DECLARE min_balance DECIMAL(12,2);
    
    -- Declare a variable to hold the max account_id
    DECLARE v_max_account_id INT;
    
    -- Check if account type is 'saving'
    IF NEW.account_type = 'saving' THEN

        -- Fetch the minimum balance for the selected saving plan
        SELECT minimum_balance INTO min_balance
        FROM Saving_Plan
        WHERE plan_id = NEW.plan_id;

        -- Check if the new balance meets the required minimum balance
        IF NEW.balance < min_balance THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Balance is below the minimum required for this saving plan.';
        END IF;

    ELSE
        IF NEW.balance < 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Checking account balance cannot be less than zero.';
        END IF;
        
        -- Ensure plan_id is NULL for checking accounts
        IF NEW.plan_id IS NOT NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Plan ID must be null for checking accounts.';
        END IF;
    END IF;
    
    -- Find the max account_id manually
    SELECT COALESCE(MAX(account_id), 0) + 1 INTO v_max_account_id FROM Customer_Account;

    -- Set the account_id manually
    SET NEW.account_id = v_max_account_id;

    -- Generate the Account_No
    SET NEW.account_number = CONCAT(
        LPAD(NEW.customer_id, 5, '0'),            
        LPAD(NEW.branch_code, 2, '0'),            
        LPAD(NEW.account_id, 4, '0'),  
        CASE NEW.account_type 
            WHEN 'saving' THEN '1'
            WHEN 'checking' THEN '2'
        END
    );
END//

DELIMITER ;

-- Create FD table
CREATE TABLE FD
(
    fd_id         INT AUTO_INCREMENT,
    plan_id       INT NOT NULL,
    account_id    INT NOT NULL,
    starting_date DATE NOT NULL,
    amount		  NUMERIC(12,2) NOT NULL,
    maturity_date DATE,
    PRIMARY KEY (fd_id),
    FOREIGN KEY (account_id) REFERENCES Customer_Account (account_id),
    FOREIGN KEY (plan_id) REFERENCES fd_plan (plan_id)

);

DELIMITER //

CREATE TRIGGER before_insert_fd
BEFORE INSERT ON FD
FOR EACH ROW
BEGIN
    DECLARE plan_months INT;

    -- Retrieve the number of months from FD_Plan based on plan_id
    SELECT months INTO plan_months
    FROM FD_Plan
    WHERE plan_id = NEW.plan_id;

    -- Calculate maturity_date
    SET NEW.maturity_date = DATE_ADD(NEW.starting_date, INTERVAL plan_months MONTH);
END //

DELIMITER ;

-- create Loan Table
CREATE TABLE Loan (
  loan_id           INT AUTO_INCREMENT,
  plan_id           INT NOT NULL,
  customer_id       INT NOT NULL,
  connected_account INT NOT NULL,
  request_date      DATE NOT NULL,
  loan_amount       NUMERIC(10,2),
  state             ENUM('pending','approved','disapproved','online'),
  fd_id				INT,
  approved_date     DATE,
  reason			VARCHAR(100),
  PRIMARY KEY (loan_id),
  FOREIGN KEY (plan_id) REFERENCES loan_plan(plan_id),
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  FOREIGN KEY (connected_account) REFERENCES Customer_Account(account_id),
  FOREIGN KEY (fd_id) REFERENCES FD(fd_id),
  CHECK ( (state = 'online' AND fd_id IS NOT NULL) OR (state != 'online' AND fd_id IS NULL))
);

DELIMITER $$

CREATE TRIGGER CheckLoanAmountBeforeInsert
BEFORE INSERT ON Loan
FOR EACH ROW
BEGIN
    DECLARE maxLoanAmount NUMERIC(10,2);

    -- Get the maximum loan amount for the plan being used
    SELECT max_amount INTO maxLoanAmount
    FROM Loan_Plan
    WHERE plan_id = NEW.plan_id;

    -- Check if the loan amount exceeds the plan's maximum limit
    IF NEW.loan_amount > maxLoanAmount THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Loan amount exceeds the maximum allowed by the loan plan.';
    END IF;
END$$

DELIMITER ;


-- Create  Loan installments table
CREATE TABLE Loan_Installment (
  loan_id               INT,
  installment_no        INT,
  installment_amount    NUMERIC(10,2),
  due_date              DATE,
  state                ENUM('pending','paid','late'),
  PRIMARY KEY (loan_id, installment_no),
  FOREIGN KEY (loan_id) REFERENCES Loan(loan_id)
);

-- Create transactions table
CREATE TABLE Account_Transaction (
  transaction_id        INT AUTO_INCREMENT,
  from_accnt            INT,
  to_accnt              INT,
  amount                NUMERIC(10,2) NOT NULL,
  trans_timestamp           TIMESTAMP NOT NULL,
  reason                VARCHAR(500),
  trans_type                  ENUM('credit', 'debit'),
  method                ENUM('atm-cdm','online','server','via_employee'),
  PRIMARY KEY (transaction_id),
  FOREIGN KEY (from_accnt) REFERENCES Customer_Account(account_id),
  FOREIGN KEY (to_accnt) REFERENCES Customer_Account (account_id)
--   CHECK ((trans_type = 'withdrawal' AND from_accnt IS NOT NULL AND to_accnt IS NULL) OR (trans_type = 'deposit' AND from_accnt IS NULL AND to_Accnt IS NOT NULL) OR
--          (trans_type = 'transfer' AND from_accnt IS NOT NULL AND to_accnt IS NOT NULL) )

);


-- Create Logs table
CREATE TABLE Log (
  log_id        	INT,
  branch_code   	INT,
  log_type      	VARCHAR(30) NOT NULL,
  log_description   VARCHAR(2000),
  log_timestamp     TIMESTAMP,
  PRIMARY KEY (log_id),
  FOREIGN KEY (branch_code) REFERENCES Branch(branch_code)
);


CREATE TABLE Otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    wrong_count INT DEFAULT 0,
    resend_count INT DEFAULT 0,
    expires_at DATETIME,
    FOREIGN KEY (username) REFERENCES User_Account(username)
);
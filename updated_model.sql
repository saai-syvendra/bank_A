DROP DATABASE IF EXISTS bank_database;

CREATE DATABASE bank_database;
USE bank_database;

-- SHOW TABLES;
CREATE TABLE User_Account (
  user_id           INT AUTO_INCREMENT,
  role				      ENUM('customer', 'employee', 'admin', 'manager') NOT NULL,
  email             VARCHAR(50) NOT NULL UNIQUE,
  address			      VARCHAR(255) NOT NULL,
  mobile			      CHAR(10) NOT NULL,
  hashed_pwd        VARCHAR(75) NOT NULL,
  PRIMARY KEY (user_id)
)AUTO_INCREMENT = 10000;

CREATE TABLE Customer (
  customer_id  INT,
  c_type       ENUM('individual','organisation') NOT NULL,
  PRIMARY KEY (customer_id),
  FOREIGN KEY (customer_id) REFERENCES User_Account(user_id)
);

CREATE TABLE Organisation_Customer (
  customer_id       INT,
  brc               CHAR(6) UNIQUE NOT NULL,
  name          	VARCHAR(50) NOT NULL,
  PRIMARY KEY (customer_id),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

CREATE TABLE Individual_Customer (
  customer_id   INT ,
  nic           CHAR(12) UNIQUE NOT NULL,
  first_name    VARCHAR(50) NOT NULL,
  last_name     VARCHAR(50) NOT NULL,
  dob			DATE NOT NULL,
  PRIMARY KEY (customer_id),
  FOREIGN KEY(customer_id) REFERENCES Customer(customer_id)
);

-- Create Branch table without FK
CREATE TABLE Branch (
  branch_code   INT AUTO_INCREMENT,
  city          VARCHAR(50) NOT NULL,
  address       VARCHAR(255) NOT NULL,
  mobile        CHAR(10) NOT NULL,
  manager_id    INT,
  PRIMARY KEY (branch_code)
)AUTO_INCREMENT = 1;

CREATE TABLE Employee_Position (
  id    		INT AUTO_INCREMENT,
  position      VARCHAR(50) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE Employee (
  emp_id         INT,
  first_name     VARCHAR(50) NOT NULL,
  last_name      VARCHAR(50) NOT NULL,
  nic            CHAR(12) NOT NULL,
  dob            DATE NOT NULL,
  branch_code    INT NOT NULL,
  position_id    INT,
  salary         NUMERIC(10,2),
  experience     VARCHAR(255),
  PRIMARY KEY (emp_id),
  FOREIGN KEY (emp_id) REFERENCES User_Account(user_id),
  FOREIGN KEY (branch_code) REFERENCES Branch(branch_code),
  FOREIGN KEY (position_id) REFERENCES Employee_Position(id)
);

-- Update the Fk of branch table
ALTER TABLE Branch
ADD CONSTRAINT fk_branch_manager
FOREIGN KEY (manager_id) REFERENCES Employee(emp_id);

CREATE TABLE Log (
  id        		INT,
  branch_code   	INT,
  type      		VARCHAR(30) NOT NULL,
  description   	VARCHAR(2000),
  timestamp     	TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (branch_code) REFERENCES Branch(branch_code)
);

CREATE TABLE Customer_Account (
  account_id        INT,
  account_number    CHAR(12) UNIQUE,
  branch_code       INT NOT NULL,
  customer_id       INT NOT NULL,
  balance           NUMERIC(12,2),
  starting_date     DATE DEFAULT (CURRENT_DATE),
  account_type      ENUM('saving','checking'),
  status            ENUM('active', 'inactive', 'dormant') DEFAULT 'active',
  PRIMARY KEY (account_id),
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  FOREIGN KEY (branch_code) REFERENCES Branch(branch_code)
);

DELIMITER //
CREATE TRIGGER AccountNumberCreation
BEFORE INSERT ON Customer_Account
FOR EACH ROW
BEGIN
    -- Declare a variable to hold the max account_id
    DECLARE v_max_account_id INT;

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

CREATE TABLE Account_Transaction (
  transaction_id        INT AUTO_INCREMENT,
  account_id            INT,
  amount                NUMERIC(10,2) NOT NULL,
  trans_timestamp       TIMESTAMP NOT NULL,
  reason                VARCHAR(500),
  trans_type            ENUM('credit', 'debit'),
  trans_method          ENUM('atm-cdm','online-transfer','server','via_employee'),
  PRIMARY KEY (transaction_id),
  FOREIGN KEY (account_id) REFERENCES customer_account(account_id)
);

CREATE TABLE Online_Transfer (
  transaction_id    INT,
  to_account_id     INT,
  PRIMARY KEY (transaction_id),
  FOREIGN KEY (transaction_id) REFERENCES Account_Transaction(transaction_id),
  FOREIGN KEY (to_account_id) REFERENCES Customer_Account(account_id)
);

-- Create Savings Plan Table
CREATE TABLE Saving_Plan (
  id           		INT AUTO_INCREMENT,
  name         		VARCHAR(50) NOT NULL,
  interest          DECIMAL(4,2) NOT NULL,
  minimum_balance   NUMERIC(12,2) DEFAULT 0,
  availability      BOOLEAN NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO Saving_Plan (name, interest, minimum_balance, availability) VALUES
('children', 12.00, 0, true),
('teen', 11.00, 500, true),
('adult', 10.00, 1000, true),
('senior', 13.00, 1000, true);

CREATE TABLE Saving_Account (
  account_id        INT,
  plan_id           INT NOT NULL,
  withdrawal_count  INT DEFAULT 0,
  PRIMARY KEY (account_id),
  FOREIGN KEY (account_id) REFERENCES Customer_Account(account_id),
  FOREIGN KEY (plan_id) REFERENCES Saving_Plan(id)
);

CREATE TABLE Daily_Account_Balance (
  account_id          INT,
  c_date              DATE NOT NULL,
  balance             NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (account_id, c_date),
  FOREIGN KEY (account_id) REFERENCES Saving_Account(account_id)
);

CREATE TABLE FD_Plan (
  id      	  	   	INT AUTO_INCREMENT,
  name      	   	VARCHAR(50) NOT NULL,
  interest          NUMERIC(4,2) NOT NULL,
  months            INT NOT NULL,
  availability      BOOLEAN,
  PRIMARY KEY (id)
);

INSERT INTO FD_Plan (name, interest, months, availability) VALUES
('Six Month', 13, 6, true),
('One Year', 14, 12, true),
('Three Years', 15, 36, true),
('Expired FD Plan', 18.5, 6, false);

CREATE TABLE FD (
    id         INT AUTO_INCREMENT,
    plan_id       INT NOT NULL,
    account_id    INT NOT NULL,
    starting_date DATE DEFAULT (CURRENT_DATE),
    amount		  NUMERIC(12,2) NOT NULL,
    maturity_date DATE,
    PRIMARY KEY (id),
    FOREIGN KEY (account_id) REFERENCES Saving_Account(account_id),
    FOREIGN KEY (plan_id) REFERENCES FD_Plan(id)
);

DELIMITER //
CREATE TRIGGER MaturiyDateCalculation
BEFORE INSERT ON FD
FOR EACH ROW
BEGIN
    DECLARE plan_months INT;

    -- Retrieve the number of months from FD_Plan based on plan_id
    SELECT months INTO plan_months
    FROM FD_Plan
    WHERE id = NEW.plan_id;

    -- Calculate maturity_date
    SET NEW.maturity_date = DATE_ADD(NEW.starting_date, INTERVAL plan_months MONTH);
END //
DELIMITER ;

CREATE TABLE Loan_Plan (
  id           		INT AUTO_INCREMENT,
  name         		VARCHAR(50) NOT NULL,
  interest          NUMERIC(4,2),
  type         		ENUM('personal','business'),
  max_amount 		NUMERIC(10,2) DEFAULT  500000.00,
  months            INT,
  availability      BOOLEAN,
  PRIMARY KEY (id)
);

INSERT INTO Loan_Plan (name, interest, type, max_amount, months, availability) VALUES
('Short Loan', 19.00, 'personal', 200000, 6, true),
('Housing Loan', 17.00, 'business', 100000.00, 48, true);

CREATE TABLE Loan (
  id           		INT AUTO_INCREMENT,
  plan_id           INT NOT NULL,
  connected_account INT NOT NULL, -- Can be a saving or checking to deposit the loan amount
  loan_type      	ENUM('branch', 'online'),
  loan_amount       NUMERIC(10,2),
  start_date        DATE,
  PRIMARY KEY (id),
  FOREIGN KEY (plan_id) REFERENCES loan_plan(id),
  FOREIGN KEY (connected_account) REFERENCES Customer_Account(account_id)
);

-- Create a table for physical loans
CREATE TABLE Branch_Loan (
    loan_id      INT,
    request_date DATE NOT NULL,
    state        ENUM ('pending','approved','disapproved') DEFAULT 'pending',
    reason       VARCHAR(100),
    PRIMARY KEY (loan_id),
    FOREIGN KEY (loan_id) REFERENCES Loan (id)
);

-- Create a table for an online loan - which does not require a reason
CREATE TABLE Online_Loan (
  loan_id 	INT,
  fd_id 	INT,
  PRIMARY KEY (loan_id),
  FOREIGN KEY (loan_id) REFERENCES Loan(id),
  FOREIGN KEY (fd_id) REFERENCES FD(id)
);

-- Create  Loan installments table
CREATE TABLE Loan_Installment (
  loan_id               INT,
  installment_no        INT,
  installment_amount    NUMERIC(10,2),
  due_date              DATE,
  state                 ENUM('pending','paid','late'),
  paid_date				DATE,
  PRIMARY KEY (loan_id, installment_no),
  FOREIGN KEY (loan_id) REFERENCES Loan(id)
);

 -- Check and Modify this table
CREATE TABLE Otps (
    id 				INT AUTO_INCREMENT PRIMARY KEY,
    email	 		VARCHAR(50) NOT NULL,
    otp 			VARCHAR(6) NOT NULL,
    wrong_count 	INT DEFAULT 0,
    resend_count 	INT DEFAULT 0,
    expires_at 		DATETIME,
    FOREIGN KEY (email) REFERENCES User_Account(email)
);


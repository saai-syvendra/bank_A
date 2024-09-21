use bank_database;

-- Insert data into Branch table
INSERT INTO Branch (branch_name, telephone) VALUES
('Head Office', '0771234567'),
('Moratuwa', '0771234568');

-- Insert data into Customer table
INSERT INTO Customer (c_type) VALUES
('individual'),
('individual'),
('individual'),
('individual'),
('individual'),
('individual'),
('individual'),
('individual'),
('organisation');

-- Insert data into Person table
INSERT INTO Person (nic, first_name, last_name, mobile, email, dob, address, customer_id) VALUES
('200246579845', 'John', 'Doe', '0771234567', 'john.doe@example.com', '1957-01-01', '123 Elm St, Moratuwa', 10000),
('199975312546', 'Jane', 'Smith', '0778765432', 'jane.smith@example.com', '2012-02-02', '456 Oak St, Dehiwala', 10001),
('200412345698', 'Alice', 'Brown', '0776543210', 'alice.brown@example.com', '1980-03-03', '789 Pine St, Rathmalana', 10002),
('196745679852', 'Bob', 'White', '0777894561', 'bob.white@example.com', '2000-04-04', '321 Maple St, Colombo 06', 10003),
('200589764321', 'Michael', 'Johnson', '0771597532', 'michael.johnson@example.com', '1985-05-05', '12 Birch St, Nugegoda', 10004),
('199812345987', 'Emily', 'Davis', '0779517536', 'emily.davis@example.com', '1999-06-06', '34 Cedar St, Battaramulla', 10005),
('200145789632', 'David', 'Miller', '0773579514', 'david.miller@example.com', '1972-07-07', '56 Palm St, Mount Lavinia', 10006),
('199356987412', 'Sarah', 'Wilson', '0776549871', 'sarah.wilson@example.com', '1995-08-08', '78 Willow St, Maharagama', 10007);

-- Insert data into Organisation table
INSERT INTO Organisation (brc, org_name, address, telephone, email, customer_id) VALUES
('35456', 'ABC Organisation', '456 Business St, Colombo', '0111234567', 'abc.org@example.com', 10008);

-- Insert data into Employee table
INSERT INTO Employee (customer_id, branch_code, position, experience, salary) VALUES
(10000, 1, 'Manager', '15 years in management', 120000.00),
(10001, 1, 'Teller', '10 years in customer service', 85000.00),
(10002, 2, 'Teller', '5 years in administration', 45000.00),
(10003, 2, 'Manager', '12 years in management', 110000.00);

-- Update Branch table to set the manager_id (FK reference to Employee)
UPDATE Branch SET manager_id = 100 WHERE branch_code = 1;
UPDATE Branch SET manager_id = 103 WHERE branch_code = 2;

-- Insert data into Customer_Account table (for savings and checking accounts)
INSERT INTO Customer_Account (plan_id, branch_code, customer_id, balance, starting_date, account_type) VALUES
(1, 1, 10000, 15000.00, '2023-09-01', 'saving'),
(2, 2, 10001, 10000.00, '2023-09-02', 'saving'),
(3, 1, 10001, 20000.00, '2023-09-03', 'saving'),
(1, 1, 10003, 18000.00, '2023-09-04', 'saving'),
( 2, 1, 10004, 12000.00, '2023-09-05', 'saving'),
(3, 2, 10005, 16000.00, '2023-09-06', 'saving'),
(1, 2, 10006, 14000.00, '2023-09-07', 'saving'),
(2, 2, 10007, 17000.00, '2023-09-08', 'saving'),
(null, 1, 10008, 50000.00, '2023-09-09', 'checking');

-- Insert data into FD table (fixed deposits)
INSERT INTO FD (plan_id, account_id, starting_date, amount) VALUES
(1, 3, '2024-05-01', 10000),
(2, 3, '2024-06-01', 25000),
(3, 6, '2024-07-20', 100000);

-- Insert data into Loan table
INSERT INTO Loan (plan_id, customer_id, connected_account, request_date, loan_amount, state, approved_date, reason) VALUES
(1, 10000, 1, '2023-07-01', 75000.00, 'approved', '2023-08-17', "Buy stuff for my house");

CALL CreateOnlineLoan(10001, 1, 1, 5000, 3, "Short quick loan for emergency");

-- Insert data into Loan_Installment table
CALL CreateLoanInstallments(1);
-- INSERT INTO Loan_Installment (loan_id, installment_no, installment_amount, due_date, state) VALUES
-- (1, 1, 14687.50, '2023-08-15', 'paid'),
-- (1, 2, 14687.50, '2023-09-15', 'paid'),
-- (1, 3, 14687.50, '2023-10-15', 'paid'),
-- (1, 4, 14687.50, '2023-11-15', 'late'),
-- (1, 5, 14687.50, '2023-12-15', 'paid'),
-- (1, 6, 14687.50, '2024-01-15', 'paid');

-- Insert data into Account_Transaction table (handling withdrawals, deposits, and transfers)
-- INSERT INTO Account_Transaction (from_accnt, to_accnt, amount, trans_timestamp, reason, trans_type, method) VALUES
-- (1, NULL, 200.00, CURRENT_TIMESTAMP, 'ATM Withdrawal', 'withdrawal', 'atm-cdm'),
-- (NULL, 2, 500.00, CURRENT_TIMESTAMP, 'Deposit via branch', 'deposit', 'via_employee'),
-- (3, 4, 300.00, CURRENT_TIMESTAMP, 'Transfer between accounts', 'transfer', 'online');


INSERT INTO User_Account (username, hashed_pwd, emp_id, user_role)
VALUES 
('emp1@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 101, 'employee'),
('emp2@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 102, 'employee'),
('man1@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 100, 'manager'),
('man2@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 103, 'manager');

INSERT INTO User_Account (username, hashed_pwd, customer_id, user_role)
VALUES 
('cus1@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 10000, 'customer'),
('cus2@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 10001, 'customer'),
('cus3@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 10002, 'customer'),
('cus4@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 10003, 'customer'),
('cus5@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 10004, 'customer'),
('cus6@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 10005, 'customer'),
('cus7@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 10006, 'customer'),
('cus8@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 10007, 'customer'),
('cus9@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 10008, 'customer');

-- Insert data into Log table
-- INSERT INTO Log (log_id, branch_code, log_type, log_description) VALUES
-- (1, 1, 'System Log', 'Initial setup of the branch system'),
-- (2, 2, 'Transaction Log', 'Customer deposited money into their account');

-- Transactions for account 1 (account_id = 1)
INSERT INTO account_transaction (accnt, amount, trans_timestamp, reason, trans_type, trans_method)
VALUES
(1, 1000.00, '2023-03-01 10:00:00', 'Salary deposit for March 2023', 'credit', 'online-transfer'),
(1, 200.00, '2023-03-05 14:30:00', 'ATM withdrawal at Branch 1', 'debit', 'atm-cdm'),
(1, 500.00, '2023-03-10 09:15:00', 'From: Accnt No - 100010200021', 'credit', 'online-transfer'),
(2, 500.00, '2023-03-10 09:15:00', 'To: Accnt No - 100000100011', 'debit', 'online-transfer');

-- Transactions for account 2 (account_id = 2)
INSERT INTO account_transaction (accnt, amount, trans_timestamp, reason, trans_type, trans_method)
VALUES
(2, 2000.00, '2023-03-02 11:00:00', 'Client payment for Project X', 'credit', 'online-transfer'),
(2, 500.00, '2023-03-07 16:45:00', 'Utility bill payment - Electricity Bill for February', 'debit', 'online-transfer'),
(2, 100.00, '2023-03-12 13:20:00', 'ATM withdrawal at Mall ATM', 'debit', 'atm-cdm');

-- Transactions for account 3 (account_id = 3)
INSERT INTO account_transaction (accnt, amount, trans_timestamp, reason, trans_type, trans_method)
VALUES
(3, 5000.00, '2023-03-03 09:30:00', 'Annual performance bonus', 'credit', 'online-transfer'),
(3, 1000.00, '2023-03-08 10:00:00', 'Monthly rent payment', 'debit', 'online-transfer'),
(3, 200.00, '2023-03-15 14:00:00', 'Quarterly interest credit', 'credit', 'server');

-- Additional transactions to showcase all transaction methods
INSERT INTO account_transaction (accnt, amount, trans_timestamp, reason, trans_type, trans_method)
VALUES
(1, 300.00, '2023-03-20 11:30:00', 'Cash deposit at branch counter', 'credit', 'via_employee'),
(2, 150.00, '2023-03-22 15:45:00', 'Refund for returned item', 'credit', 'server'),
(3, 750.00, '2023-03-25 09:00:00', 'Withdrawal processed by teller', 'debit', 'via_employee');

-- Additional diverse transactions
INSERT INTO account_transaction (accnt, amount, trans_timestamp, reason, trans_type, trans_method)
VALUES
(1, 50.00, '2023-03-26 12:00:00', 'To: Accnt No - 100010200021', 'debit', 'online-transfer'),
(2, 50.00, '2023-03-26 12:00:00', 'From: Accnt No - 100000100011', 'credit', 'online-transfer'),
(2, 75.00, '2023-03-27 10:30:00', 'To: Accnt No - 100000100011', 'debit', 'online-transfer'),
(1, 75.00, '2023-03-27 10:30:00', 'From: Accnt No - 100010200021', 'credit', 'online-transfer'),
(1, 400.00, '2023-03-28 09:00:00', 'Cash deposit via ATM', 'credit', 'atm-cdm');


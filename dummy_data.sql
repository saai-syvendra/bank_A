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
INSERT INTO Person (nic, first_name, last_name, mobile, email, dob, address, telephone, customer_id) VALUES
('200246579845', 'John', 'Doe', '0771234567', 'john.doe@example.com', '1957-01-01', '123 Elm St, Moratuwa', '0715489758', 10000),
('199975312546', 'Jane', 'Smith', '0778765432', 'jane.smith@example.com', '2012-02-02', '456 Oak St, Dehiwala', '0714567589', 10001),
('200412345698', 'Alice', 'Brown', '0776543210', 'alice.brown@example.com', '1980-03-03', '789 Pine St, Rathmalana', '0714528796', 10002),
('196745679852', 'Bob', 'White', '0777894561', 'bob.white@example.com', '2000-04-04', '321 Maple St, Colombo 06', '0778945612', 10003),
('200589764321', 'Michael', 'Johnson', '0771597532', 'michael.johnson@example.com', '1985-05-05', '12 Birch St, Nugegoda', '0716584975', 10004),
('199812345987', 'Emily', 'Davis', '0779517536', 'emily.davis@example.com', '1999-06-06', '34 Cedar St, Battaramulla', '0715497365', 10005),
('200145789632', 'David', 'Miller', '0773579514', 'david.miller@example.com', '1972-07-07', '56 Palm St, Mount Lavinia', '0712584963', 10006),
('199356987412', 'Sarah', 'Wilson', '0776549871', 'sarah.wilson@example.com', '1995-08-08', '78 Willow St, Maharagama', '0714987521',10007);

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
(3, 1, 10008, 50000.00, '2023-09-09', 'checking');

-- Insert data into FD table (fixed deposits)
INSERT INTO FD (plan_id, account_id, starting_date, maturity_date) VALUES
(1, 3, '2024-05-01', '2024-08-01'),
(2, 3, '2024-06-01', '2025-06-01'),
(3, 6, '2024-07-20', '2027-07-20');

-- Insert data into Loan table
INSERT INTO Loan (plan_id, customer_id, connected_account, started_date, loan_amount, state) VALUES
(1, 10000, 1, '2023-07-01', 750000.00, 'approved');

-- Insert data into Loan_Installment table
INSERT INTO Loan_Installment (loan_id, installment_no, installment_amount, due_date, state) VALUES
(1, 1, 14687.50, '2023-08-15', 'paid'),
(1, 2, 14687.50, '2023-09-15', 'paid'),
(1, 3, 14687.50, '2023-10-15', 'paid'),
(1, 4, 14687.50, '2023-11-15', 'late'),
(1, 5, 14687.50, '2023-12-15', 'paid'),
(1, 6, 14687.50, '2024-01-15', 'paid');

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

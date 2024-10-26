USE bank_database;

-- DESCRIBE user_account;

INSERT INTO User_Account (user_id, email, hashed_pwd, role, address, mobile) VALUES
(10000,'man1@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'manager', '123 Palm St, Victoria, Mahe', '0771234567'),
(10001,'emp1@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'employee', '456 Coral Ave, Beau Vallon, Mahe', '0777654321'),
(10002,'emp2@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'employee', '789 Manager Dr, Anse Royale, Mahe', '0779876543'),
(10003,'man2@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'manager', '101 Admin Rd, Takamaka, Mahe', '0776549871'),

(10004,'cus1@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '12 Coconut St, La Digue', '0771122334'),
(10005,'cus2@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '34 Mango Ave, Praslin', '0772233445'),
(10006,'cus3@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '56 Frangipani St, Baie Lazare, Mahe', '0773344556'),
(10007,'cus4@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '78 Hibiscus Rd, Anse Boileau, Mahe', '0774455667'),
(10008,'cus5@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '90 Orchid Ave, Glacis, Mahe', '0775566778'),
(10009,'cus6@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '1-59 Rouge St, La Digue', '0771122334'),
(10010,'cus7@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '39 Mango Ave, Praslin', '0772233445'),

(10011,'emp3@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'employee', '56 Frangipani St, Baie Lazare, Praslin', '0773344556'),
(10012,'man3@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'manager', '78 Hibiscus Rd, Anse Boileau, Praslin', '0774455667'),
(10013,'man4@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'manager', '90 Orchid Ave, Glacis, La Digue', '0775566778'),
(10014,'emp4@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'employee', '700 Rouge St, La Digue', '0771122334');



INSERT INTO Customer (customer_id, c_type) VALUES
(10004, 'individual'),
(10005, 'individual'),
(10006, 'organisation'),
(10007, 'organisation'),
(10008, 'individual'),
(10009, 'individual'),
(10010, 'organisation');

INSERT INTO Individual_Customer (customer_id, nic, first_name, last_name, dob) VALUES
(10004, '198845678912', 'John', 'Doe', '1988-06-07'),
(10005, '200512345678', 'Jane', 'Smith', '2005-03-22'),
(10008, '199912345678', 'Ron', 'Weasley', '1999-12-25'),
(10009, '199912345878', 'Hermione', 'Granger', '1999-12-25');


INSERT INTO Organisation_Customer (customer_id, brc, name) VALUES
(10006, '123158', 'Tech Innovators Ltd'),
(10007, '156789', 'Green Solutions Inc'),
(10010, '123150', 'ABC Corporation (Pvt) Ltd');

INSERT INTO Branch (city, address, mobile) VALUES
('Victoria', '123 Ocean Dr, Victoria, Mahe', '0771234567'),
('Anse Royale', '456 Beach Rd, Anse Royale, Mahe', '0777654321'),
('La Digue Central', '789 Hill St, La Digue', '0779876543'),
('Praslin North', '101 Forest Ave, Praslin', '0776549871');

INSERT INTO Employee_Position (emp_position) VALUES
('Manager'),
('Customer Service Representative'),
('Teller'),
('Branch Administrator');

-- SELECT * FROM Employee;

-- DELETE FROM Employee;
INSERT INTO Employee (emp_id, first_name, last_name, nic, dob, branch_code, position_id, salary, experience) VALUES
(10000, 'Alice', 'Johnson', '199999999999', '1985-01-15', 1, 1, 120000.00, '10 years in banking management'),  -- Manager
(10001, 'Bob', 'Smith', '199888888888', '1990-03-20', 1, 3, 60000.00, '5 years in customer service'),        -- Teller
(10002, 'Charlie', 'Brown', '199777777777', '1980-06-25', 2, 1, 115000.00, '12 years operation'), -- Branch Administrator
(10003, 'David', 'Wilson', '199666666666', '1988-08-30', 2, 4, 80000.00, '7 years in banking management'), -- Manager

(10011, 'Eve', 'Williams', '199555555555', '1995-10-05', 3, 2, 50000.00, '2 years in customer service'), -- Teller
(10012, 'Frank', 'Miller', '199444444444', '1987-12-10', 3, 1, 110000.00, '10 years management'), -- Manager
(10013, 'Grace', 'Davis', '199333333333', '1989-02-15', 4, 4, 75000.00, '7 years in banking management'), -- Manager
(10014, 'Hannah', 'Martinez', '199222222222', '1992-04-20', 4, 3, 55000.00, '3 years in customer service'); -- Branch Administrator

-- Update Branch table to set the manager_id (FK reference to Employee)
UPDATE Branch SET manager_id = 10000 WHERE branch_code = 1;
UPDATE Branch SET manager_id = 10002 WHERE branch_code = 2;
UPDATE Branch SET manager_id = 10013 WHERE branch_code = 3;
UPDATE Branch SET manager_id = 10012 WHERE branch_code = 4;

-- Insert data into Customer_Account table (for savings and checking accounts)
INSERT INTO Customer_Account (branch_code, customer_id, balance, starting_date, account_type) VALUES
(1, 10004, 15000.00, '2020-09-01', 'saving'),
(2, 10004, 10000.00, '2021-09-02', 'checking'),
(2, 10005, 20000.00, '2019-09-03', 'saving'),
(1, 10006, 18000.00, '2022-09-04', 'checking'),
(2, 10007, 12000.00, '2023-09-05', 'checking'),
(2, 10008, 18000.00, '2023-09-15', 'saving'),
(3, 10008, 125250.00, '2024-09-15', 'saving'),
(4, 10010, 10000.00, '2024-09-15', 'checking'),
(3, 10009, 10000.00, '2024-09-17', 'checking'),
(4, 10009, 15000.00, '2024-09-18', 'saving');

INSERT INTO Saving_Account (account_id, plan_id) VALUES
(1, 3),
(3, 2),
(6, 3),
(7, 1),
(10, 2);

-- 2022 Transactions

INSERT INTO Account_Transaction (account_id, amount, trans_timestamp, reason, trans_type, trans_method) VALUES
(1, 150.00, '2022-01-05 08:20:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(1, 350.00, '2022-01-12 10:40:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(2, 200.00, '2022-02-03 09:30:00', 'Subscription Fee', 'debit', 'online-transfer'),
(2, 500.00, '2022-02-10 12:50:00', 'Gift Deposit', 'credit', 'via_employee'),
(3, 100.00, '2022-03-04 14:15:00', 'ATM Fee', 'debit', 'atm-cdm'),
(3, 400.00, '2022-03-15 16:20:00', 'Deposit by Employee', 'credit', 'via_employee'),
(4, 300.00, '2022-04-02 09:45:00', 'Utility Bill Payment', 'debit', 'server'),
(4, 200.00, '2022-04-12 13:30:00', 'Salary Credit', 'credit', 'server'),
(5, 250.00, '2022-05-01 08:00:00', 'Grocery Shopping', 'debit', 'via_employee'),
(5, 100.00, '2022-05-08 14:05:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(6, 300.00, '2022-06-05 10:50:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(6, 400.00, '2022-06-10 12:15:00', 'Loan Repayment', 'debit', 'server'),
(7, 150.00, '2022-07-01 09:30:00', 'Shopping', 'debit', 'online-transfer'),
(7, 600.00, '2022-07-07 15:45:00', 'Bonus Credit', 'credit', 'server'),
(8, 350.00, '2022-08-03 16:10:00', 'Loan Repayment', 'debit', 'server'),
(8, 100.00, '2022-08-12 09:55:00', 'Cashback', 'credit', 'via_employee'),
(9, 400.00, '2022-09-01 08:40:00', 'Deposit by Employee', 'credit', 'via_employee'),
(9, 250.00, '2022-09-06 11:20:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(10, 300.00, '2022-10-01 13:50:00', 'Online Purchase', 'debit', 'online-transfer'),
(10, 500.00, '2022-10-10 14:00:00', 'Deposit via Employee', 'credit', 'via_employee'),
(1, 100.00, '2022-11-01 09:05:00', 'Utility Payment', 'debit', 'server'),
(1, 150.00, '2022-11-12 11:10:00', 'Loan Repayment', 'debit', 'server'),
(2, 200.00, '2022-11-25 12:35:00', 'Bonus Credit', 'credit', 'server'),
(2, 300.00, '2022-12-01 14:20:00', 'Cash Deposit', 'credit', 'atm-cdm'),
(3, 400.00, '2022-12-05 08:55:00', 'Service Fee', 'debit', 'server'),
(3, 250.00, '2022-12-08 15:15:00', 'Interest Payment', 'credit', 'server'),
(4, 500.00, '2022-12-12 10:05:00', 'Loan Repayment', 'debit', 'server'),
(4, 600.00, '2022-12-18 16:45:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(5, 700.00, '2022-12-20 09:30:00', 'Account Adjustment', 'credit', 'server'),
(6, 450.00, '2022-12-28 11:55:00', 'Mobile Bill Payment', 'debit', 'via_employee');


-- 2023 Transactions

INSERT INTO Account_Transaction (account_id, amount, trans_timestamp, reason, trans_type, trans_method) VALUES
(1, 250.00, '2023-01-03 09:15:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(1, 450.00, '2023-01-10 11:30:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(2, 125.00, '2023-02-05 10:00:00', 'Service Charge', 'debit', 'server'),
(2, 500.00, '2023-02-08 14:20:00', 'Deposit by Employee', 'credit', 'via_employee'),
(3, 200.00, '2023-03-03 12:15:00', 'Online Purchase', 'debit', 'online-transfer'),
(3, 750.00, '2023-03-15 16:40:00', 'Gift Deposit', 'credit', 'via_employee'),
(4, 100.00, '2023-04-01 09:50:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(4, 600.00, '2023-04-05 14:25:00', 'Cashback', 'credit', 'server'),
(5, 400.00, '2023-05-10 10:35:00', 'Bill Payment', 'debit', 'via_employee'),
(5, 150.00, '2023-05-12 09:05:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(6, 500.00, '2023-06-01 08:20:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(6, 250.00, '2023-06-10 13:40:00', 'Cash Deposit', 'credit', 'via_employee'),
(7, 200.00, '2023-07-03 17:10:00', 'Subscription Fee', 'debit', 'online-transfer'),
(7, 350.00, '2023-07-15 15:25:00', 'Gift Deposit', 'credit', 'via_employee'),
(8, 75.00, '2023-08-01 09:00:00', 'ATM Fee', 'debit', 'atm-cdm'),
(8, 500.00, '2023-08-07 12:00:00', 'Salary Credit', 'credit', 'server'),
(9, 300.00, '2023-09-01 08:45:00', 'Insurance Payment', 'debit', 'via_employee'),
(9, 450.00, '2023-09-05 11:15:00', 'Deposit via Employee', 'credit', 'via_employee'),
(10, 200.00, '2023-10-03 16:30:00', 'Utility Payment', 'debit', 'server'),
(10, 300.00, '2023-10-10 09:45:00', 'Cash Deposit', 'credit', 'atm-cdm'),
(1, 100.00, '2023-11-03 07:50:00', 'Mobile Bill', 'debit', 'via_employee'),
(1, 250.00, '2023-11-15 10:05:00', 'Loan Repayment', 'debit', 'server'),
(2, 500.00, '2023-11-20 12:20:00', 'Deposit via Employee', 'credit', 'via_employee'),
(2, 150.00, '2023-11-25 14:30:00', 'Interest Payment', 'credit', 'server'),
(3, 400.00, '2023-12-01 09:15:00', 'Shopping', 'debit', 'online-transfer'),
(3, 300.00, '2023-12-07 11:35:00', 'Deposit by Employee', 'credit', 'via_employee'),
(4, 100.00, '2023-12-10 13:50:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(4, 200.00, '2023-12-15 16:10:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(5, 250.00, '2023-12-18 09:00:00', 'Loan Repayment', 'debit', 'server'),
(6, 350.00, '2023-12-25 15:00:00', 'Interest Credit', 'credit', 'server');



-- 2024 Transactions
INSERT INTO Account_Transaction (account_id, amount, trans_timestamp, reason, trans_type, trans_method) VALUES

(1, 100.00, '2024-01-05 14:30:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(1, 250.00, '2024-01-12 09:45:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(1, 300.00, '2024-01-15 16:20:00', 'Shopping', 'debit', 'via_employee'),
(1, 200.00, '2024-01-20 11:00:00', 'Cashback', 'credit', 'server'),
(2, 300.00, '2024-02-02 12:30:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(2, 100.00, '2024-02-10 10:45:00', 'Fund Transfer Fee', 'debit', 'server'),
(2, 500.00, '2024-02-15 14:00:00', 'Bonus Credit', 'debit', 'online-transfer'),
(2, 250.00, '2024-02-20 09:30:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(3, 2000.00, '2024-03-01 08:10:00', 'Invoice Payment', 'debit', 'online-transfer'),
(3, 350.00, '2024-03-05 15:25:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(3, 750.00, '2024-03-12 09:15:00', 'Deposit by Check', 'debit', 'via_employee'),
(3, 400.00, '2024-03-18 12:45:00', 'Online Purchase', 'debit', 'via_employee'),
(3, 600.00, '2024-03-20 17:10:00', 'Salary Adjustment', 'debit', 'online-transfer'),
(4, 300.00, '2024-04-02 07:30:00', 'Gift Deposit', 'credit', 'via_employee'),
(4, 50.00, '2024-04-05 14:30:00', 'ATM Fee', 'debit', 'atm-cdm'),
(4, 200.00, '2024-04-10 16:20:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(4, 80.00, '2024-04-12 09:00:00', 'Mobile Top-up', 'debit', 'via_employee'),
(4, 100.00, '2024-04-15 11:15:00', 'Interest Payment', 'credit', 'server'),
(5, 1500.00, '2024-05-01 08:05:00', 'Loan Disbursement', 'credit', 'server'),
(5, 200.00, '2024-05-02 13:45:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(5, 300.00, '2024-05-05 09:30:00', 'Deposit from Client', 'credit', 'via_employee'),
(5, 400.00, '2024-05-10 15:20:00', 'Online Shopping', 'debit', 'via_employee'),
(5, 500.00, '2024-05-12 17:00:00', 'Transfer from Account', 'debit', 'online-transfer'),
(6, 200.00, '2024-06-03 16:35:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(6, 150.00, '2024-06-07 08:50:00', 'Electric Bill', 'debit', 'via_employee'),
(6, 300.00, '2024-06-12 14:45:00', 'Grocery Shopping', 'debit', 'via_employee'),
(6, 400.00, '2024-06-18 10:30:00', 'Loan Repayment', 'debit', 'server'),
(1, 2500.00, '2024-07-01 09:15:00', 'Business Payment', 'credit', 'via_employee'),
(1, 350.00, '2024-07-03 12:40:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(1, 600.00, '2024-07-07 16:15:00', 'Deposit via Employee', 'credit', 'via_employee'),
(1, 500.00, '2024-07-12 08:50:00', 'Loan Repayment', 'debit', 'server'),
(1, 700.00, '2024-07-15 17:10:00', 'Cheque Deposit', 'credit', 'via_employee'),
(2, 150.00, '2024-08-02 10:35:00', 'Mobile Bill', 'debit', 'via_employee'),
(2, 200.00, '2024-08-05 13:25:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(2, 350.00, '2024-08-10 11:15:00', 'Groceries', 'debit', 'via_employee'),
(2, 600.00, '2024-08-20 09:45:00', 'Account Adjustment', 'credit', 'server'),
(2, 1000.00, '2024-09-01 12:00:00', 'Investment Return', 'debit', 'atm-cdm'),
(3, 250.00, '2024-09-03 14:20:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(3, 500.00, '2024-09-07 08:15:00', 'Cash Deposit', 'credit', 'via_employee'),
(3, 150.00, '2024-09-10 16:40:00', 'Credit Card Payment', 'debit', 'via_employee'),
(3, 200.00, '2024-09-12 10:05:00', 'Loan Interest', 'debit', 'server'),
(4, 2200.00, '2024-10-01 15:00:00', 'Insurance Claim', 'credit', 'online-transfer'),
(5, 100.00, '2024-10-03 09:45:00', 'ATM Withdrawal', 'debit', 'atm-cdm'),
(6, 300.00, '2024-10-08 11:30:00', 'Utility Bill Payment', 'debit', 'via_employee'),
(5, 150.00, '2024-10-10 08:30:00', 'CDM Deposit', 'credit', 'atm-cdm'),
(1, 500.00, '2024-10-12 14:45:00', 'Bonus Credit', 'credit', 'server');

SELECT * FROM online_transfer;

-- Online Transfers for 2022
INSERT INTO Online_Transfer (transaction_id, to_account_id) VALUES
(3,8), -- Subscription Fee for account 2
(13, 5), -- Shopping for account 7
(19, 3); -- Online Purchase for account 10

-- Online Transfers for 2023
INSERT INTO Online_Transfer (transaction_id, to_account_id) VALUES
(54,4), -- Online Purchase for account 3
(68,6), -- Subscription Fee for account 7
(93, 9); -- Shopping for account 3

SELECT * FROM account_transaction ORDER BY account_transaction.trans_timestamp DESC;
SELECT * FROM online_transfer;
-- Online Transfers for 2024
INSERT INTO Online_Transfer (transaction_id, to_account_id) VALUES
(102, 2); -- Transfer Fee for account 2
-- (100, 3), -- Invoice Payment for account 3
-- (105, 5), -- Online Shopping for account 5
-- (111, 6); -- Salary Adjustment for account 6
-- Add Dummy Data To FDs, Loans and Loan installments

INSERT INTO FD (plan_id, account_id, starting_date, amount) VALUES
(1, 1, '2024-05-01', 10000),
(2, 3, '2024-06-01', 25000),
(1, 6, '2024-06-03', 10000),
(2, 1, '2024-07-01', 25000),
(1, 3, '2024-07-11', 10000),
(2, 6, '2024-10-01', 25000);

-- Insert Loans for various plans, accounts, and types
INSERT INTO Loan (plan_id, connected_account, loan_type, loan_amount, start_date) VALUES
(1, 1, 'online', 150000.00, '2024-01-10'),
(1, 2, 'branch', 100000.00, '2024-02-15'),
(2, 3, 'online', 250000.00, '2024-03-05'),
(1, 4, 'branch', 120000.00, '2024-04-10'),
(2, 5, 'branch', 300000.00,  NULL),
(1, 6, 'online', 180000.00, '2024-06-15'),
(2, 1, 'online', 350000.00, '2024-07-25'),
(1, 3, 'online', 90000.00, '2024-08-05'),
(2, 4, 'branch', 270000.00, '2024-09-15'),
(1, 5, 'branch', 200000.00, '2024-10-01');

INSERT INTO Branch_Loan (loan_id, request_date, state, reason) VALUES
(2, '2024-02-25', 'approved', 'For business expansion'),
(4, '2024-05-01', 'approved', 'Renovation of premises'),
(5, '2024-05-15', 'pending', 'Renovation'),
(7, '2024-07-20', 'disapproved', 'Credit score insufficient'),
(9, '2024-09-10', 'approved', 'Purchase of new equipment'),
(10, '2024-10-10', 'approved', 'Purchase of new stuff');

INSERT INTO Online_Loan (loan_id, fd_id) VALUES
(1, 1),
(3, 2),
(6, 3),
(7, 4),
(8, 5);

INSERT INTO Loan_Installment (loan_id, installment_no, installment_amount, due_date, state, paid_date) VALUES
(1, 1, 25000.00, '2024-02-10', 'paid', '2024-02-08'),
(1, 2, 25000.00, '2024-03-10', 'paid', '2024-03-09'),
(1, 3, 25000.00, '2024-04-10', 'late', '2024-04-15'),
(1, 4, 25000.00, '2024-05-10', 'paid', '2024-05-09'),
(1, 5, 25000.00, '2024-06-10', 'pending', NULL),
(1, 6, 25000.00, '2024-07-10', 'pending', NULL),
(2, 1, 16666.67, '2024-03-15', 'paid', '2024-03-14'),
(2, 2, 16666.67, '2024-04-15', 'paid', '2024-04-12'),
(2, 3, 16666.67, '2024-05-15', 'late', '2024-05-18'),
(2, 4, 16666.67, '2024-06-15', 'pending', NULL),
(2, 5, 16666.67, '2024-07-15', 'pending', NULL),
(2, 6, 16666.67, '2024-08-15', 'pending', NULL),
(3, 1, 41666.67, '2024-04-05', 'paid', '2024-04-03'),
(3, 2, 41666.67, '2024-05-05', 'paid', '2024-05-03'),
(3, 3, 41666.67, '2024-06-05', 'late', '2024-06-10'),
(3, 4, 41666.67, '2024-07-05', 'pending', NULL),
(3, 5, 41666.67, '2024-08-05', 'pending', NULL),
(3, 6, 41666.67, '2024-09-05', 'pending', NULL),
(4, 1, 20000.00, '2024-05-10', 'paid', '2024-05-09'),
(4, 2, 20000.00, '2024-06-10', 'paid', '2024-06-08'),
(4, 3, 20000.00, '2024-07-10', 'late', '2024-07-12'),
(4, 4, 20000.00, '2024-08-10', 'pending', NULL),
(4, 5, 20000.00, '2024-09-10', 'pending', NULL),
(4, 6, 20000.00, '2024-10-10', 'pending', NULL),
(5, 1, 50000.00, '2024-06-20', 'paid', '2024-06-19'),
(5, 2, 50000.00, '2024-07-20', 'paid', '2024-07-18'),
(5, 3, 50000.00, '2024-08-20', 'late', '2024-08-25'),
(5, 4, 50000.00, '2024-09-20', 'pending', NULL),
(5, 5, 50000.00, '2024-10-20', 'pending', NULL),
(5, 6, 50000.00, '2024-11-20', 'pending', NULL),
(6, 1, 30000.00, '2024-07-15', 'paid', '2024-07-14'),
(6, 2, 30000.00, '2024-08-15', 'paid', '2024-08-13'),
(6, 3, 30000.00, '2024-09-15', 'late', '2024-09-18'),
(6, 4, 30000.00, '2024-10-15', 'pending', NULL),
(6, 5, 30000.00, '2024-11-15', 'pending', NULL),
(6, 6, 30000.00, '2024-12-15', 'pending', NULL),
(7, 1, 58333.33, '2024-08-25', 'paid', '2024-08-23'),
(7, 2, 58333.33, '2024-09-25', 'paid', '2024-09-23'),
(7, 3, 58333.33, '2024-10-25', 'late', '2024-10-29'),
(7, 4, 58333.33, '2024-11-25', 'pending', NULL),
(7, 5, 58333.33, '2024-12-25', 'pending', NULL),
(7, 6, 58333.33, '2025-01-25', 'pending', NULL),
(8, 1, 15000.00, '2024-09-05', 'paid', '2024-09-04'),
(8, 2, 15000.00, '2024-10-05', 'paid', '2024-10-03'),
(8, 3, 15000.00, '2024-11-05', 'late', '2024-11-10'),
(8, 4, 15000.00, '2024-12-05', 'pending', NULL),
(8, 5, 15000.00, '2025-01-05', 'pending', NULL),
(8, 6, 15000.00, '2025-02-05', 'pending', NULL),
(9, 1, 45000.00, '2024-10-15', 'paid', '2024-10-13'),
(9, 2, 45000.00, '2024-11-15', 'paid', '2024-11-13'),
(9, 3, 45000.00, '2024-12-15', 'late', '2024-12-20'),
(9, 4, 45000.00, '2025-01-15', 'pending', NULL),
(9, 5, 45000.00, '2025-02-15', 'pending', NULL),
(9, 6, 45000.00, '2025-03-15', 'pending', NULL),
(10, 1, 33333.33, '2023-11-01', 'paid', '2023-10-29'),
(10, 2, 33333.33, '2023-12-01', 'paid', '2023-11-28'),
(10, 3, 33333.33, '2024-01-01', 'late', '2024-01-05'),
(10, 4, 33333.33, '2024-02-01', 'pending', NULL),
(10, 5, 33333.33, '2024-03-01', 'pending', NULL),
(10, 6, 33333.33, '2024-04-01', 'pending', NULL);

CALL CreateBranchLoan(10004,2,70500,2,"Home renovations");
CALL CreateOnlineLoan(10005,1,2,9500,3);
CALL PayInstallment(12, 1, 1);

CALL CreateCustomer('mary.poppins@abc.def', '123, Rand Street, That Place', 0718945625, 'individual', 198845678945, 'Mary', 'Poppins', '1992-05-17', null, null);

CALL CreateAccount(1, 10008, 125250,'saving');

CALL CreateFd(2, 6, 3500);

CALL TransferMoney (6, 1, 1254, 'Books money', @id);

CALL WithdrawMoney(6, 750, 'atm-cdm', @id);
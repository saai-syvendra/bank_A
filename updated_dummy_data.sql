USE bank_database;

INSERT INTO User_Account (email, hashed_pwd, role, address, mobile) VALUES
('man1@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'manager', '123 Palm St, Victoria, Mahe', '0771234567'),
('emp1@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'employee', '456 Coral Ave, Beau Vallon, Mahe', '0777654321'),
('emp2@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'manager', '789 Manager Dr, Anse Royale, Mahe', '0779876543'),
('man2@bank.abc', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'employee', '101 Admin Rd, Takamaka, Mahe', '0776549871'),
('cus1@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '12 Coconut St, La Digue', '0771122334'),
('cus2@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '34 Mango Ave, Praslin', '0772233445'),
('cus3@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '56 Frangipani St, Baie Lazare, Mahe', '0773344556'),
('cus4@abc.def', '$2b$10$1ZZL9N6NxS3dCfU2qQqfre8vAhDScNPFiDejSCjoRUAa3Av3oRNcO', 'customer', '78 Hibiscus Rd, Anse Boileau, Mahe', '0774455667');

INSERT INTO Customer (customer_id, c_type) VALUES
(10004, 'individual'),
(10005, 'individual'),
(10006, 'organisation'),
(10007, 'organisation');

INSERT INTO Individual_Customer (customer_id, nic, first_name, last_name, dob) VALUES
(10004, '198845678912', 'John', 'Doe', '1988-06-07'),
(10005, '200512345678', 'Jane', 'Smith', '2005-03-22');

INSERT INTO Organisation_Customer (customer_id, brc, name) VALUES
(10006, '123158', 'Tech Innovators Ltd'),
(10007, '156789', 'Green Solutions Inc');

INSERT INTO Branch (city, address, mobile) VALUES
('Victoria', '123 Ocean Dr, Victoria, Mahe', '0771234567'),
('Anse Royale', '456 Beach Rd, Anse Royale, Mahe', '0777654321');

INSERT INTO Employee_Position (emp_position) VALUES
('Manager'),
('Customer Service Representative'),
('Teller'),
('Branch Administrator');

INSERT INTO Employee (emp_id, first_name, last_name, nic, dob, branch_code, position_id, salary, experience) VALUES
(10000, 'Alice', 'Johnson', '199999999999', '1985-01-15', 1, 1, 120000.00, '10 years in banking management'),  -- Manager
(10001, 'Bob', 'Smith', '199888888888', '1990-03-20', 1, 3, 60000.00, '5 years in customer service'),        -- Teller
(10002, 'Charlie', 'Brown', '199777777777', '1980-06-25', 2, 1, 115000.00, '12 years in banking management'), -- Manager
(10003, 'David', 'Wilson', '199666666666', '1988-08-30', 2, 4, 80000.00, '7 years in operations');           -- Branch Administrator

-- Update Branch table to set the manager_id (FK reference to Employee)
UPDATE Branch SET manager_id = 10000 WHERE branch_code = 1;
UPDATE Branch SET manager_id = 10002 WHERE branch_code = 2;

-- Insert data into Customer_Account table (for savings and checking accounts)
INSERT INTO Customer_Account (branch_code, customer_id, balance, starting_date, account_type) VALUES
(1, 10004, 15000.00, '2023-09-01', 'saving'),
(2, 10004, 10000.00, '2023-09-02', 'checking'),
(2, 10005, 20000.00, '2023-09-03', 'saving'),
(1, 10006, 18000.00, '2023-09-04', 'checking'),
(2, 10007, 12000.00, '2023-09-05', 'checking'),
(2, 10007, 12000.00, '2023-09-15', 'saving');

INSERT INTO Saving_Account (account_id, plan_id) VALUES
(1, 3),
(3, 2),
(6, 3);

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

INSERT INTO Online_Transfer (transaction_id, to_account_id) VALUES
(7, 3),  -- From account 2 to account 3
(9, 4),  -- From account 2 to account 4
(13, 6), -- From account 3 to account 6
(23, 1), -- From account 5 to account 1
(42, 3); -- From account 2 to account 3

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
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

INSERT INTO Employee_Position (position) VALUES
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
(2, 10007, 12000.00, '2023-09-05', 'checking');

INSERT INTO Saving_Account (account_id, plan_id) VALUES
(1, 3),
(3, 2);

INSERT INTO Account_Transaction (account_id, amount, trans_timestamp, reason, trans_type, trans_method) VALUES
(1, 1000.00, CURRENT_TIMESTAMP, 'Saving Interest', 'credit', 'server'),
(1, 200.00, CURRENT_TIMESTAMP+2, 'ATM withdrawal', 'debit', 'atm-cdm'),
(1, 200.00, CURRENT_TIMESTAMP+7, 'CDM deposit', 'credit', 'atm-cdm'),
(2, 500.00, CURRENT_TIMESTAMP+9, 'Deposit from client', 'credit', 'via_employee'),
(3, 1500.00, CURRENT_TIMESTAMP+10, 'Payment for invoice', 'credit', 'online-transfer'),
(4, 100.00, CURRENT_TIMESTAMP+15, 'Cash deposit', 'credit', 'via_employee'),
(5, 250.00, CURRENT_TIMESTAMP+19, 'Loan disbursement', 'credit', 'server');

INSERT INTO Online_Transfer (transaction_id, to_account_id) VALUES
(5, 5); -- Online transfer from account_id 3 to account_id 5

INSERT INTO FD (plan_id, account_id, starting_date, amount) VALUES
(1, 1, '2024-05-01', 10000),
(2, 3, '2024-06-01', 25000);

INSERT INTO Loan (plan_id, connected_account, loan_type, loan_amount, start_date) VALUES
(1, 1, 'branch', 75000.00, '2023-08-17'),
(1, 1, 'online', 45000.00, CURDATE());

INSERT INTO Branch_Loan (loan_id, request_date, state, reason) VALUES
(1, '2023-08-02', 'pending', 'Buy stuff for house');

INSERT INTO Online_Loan (loan_id, fd_id) VALUES
(2, 2);

CALL CreateLoanInstallments(2);

CALL CreateBranchLoan(10004,2,70500,2,"Home renovations");
CALL CreateOnlineLoan(10005,1,2,9500,3);
CALL ApproveLoan(3);
CALL PayInstallment(2, 1, 1);
CALL PayInstallment(2, 2, 3);

CALL CreateCustomer('mary.poppins@abc.def', '123, Rand Street, That Place', 0718945625, 'individual', 198845678945, 'Mary', 'Poppins', '1992-05-17', null, null);

CALL CreateAccount(1, 10008, 125250,'saving');

CALL CreateFd(2, 6, 35000);

CALL TransferMoney (6, 1, 1254, 'Books money', @id);

CALL WithdrawMoney(6, 7500, @id);
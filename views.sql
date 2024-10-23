use bank_database;

-- DROP VIEW IF EXISTS online_loan_view;

CREATE VIEW online_loan_view AS 
SELECT 
    loan.id AS loan_id,
    customer_account.customer_id AS customer_id,
    loan.start_date AS approved_date,
    loan.loan_amount AS loan_amount,
    'online' AS state, 
    customer_account.branch_code AS branch_code,
    loan_plan.name AS plan_name,
    loan_plan.id AS plan_id
FROM loan
INNER JOIN loan_plan ON loan.plan_id = loan_plan.id
INNER JOIN customer_account ON loan.connected_account = customer_account.account_id
WHERE loan.id NOT IN (SELECT loan_id FROM branch_loan);

-- DROP VIEW IF EXISTS branch_loan_view;

CREATE VIEW branch_loan_view AS 
SELECT 
    loan.id AS loan_id,
    customer_account.customer_id AS customer_id,
    loan.start_date AS approved_date,
    loan.loan_amount AS loan_amount,
	branch_loan.state AS state,
    customer_account.branch_code AS branch_code,
    loan_plan.name AS plan_name,
    loan_plan.id AS plan_id
FROM loan
INNER JOIN loan_plan ON loan.plan_id = loan_plan.id
INNER JOIN branch_loan ON loan.id = branch_loan.loan_id
INNER JOIN customer_account ON loan.connected_account = customer_account.account_id;

-- DROP VIEW IF EXISTS transaction_view;

CREATE VIEW transaction_view AS 
SELECT 
    account_transaction.amount AS amount,
    account_transaction.trans_timestamp AS trans_timestamp,
    account_transaction.reason AS reason,
    account_transaction.trans_type AS trans_type,
    account_transaction.trans_method AS trans_method,
    customer_account.branch_code AS branch_code,
    online_transfer.to_account_id AS to_account_id
FROM account_transaction
INNER JOIN customer_account 
    ON customer_account.account_id = account_transaction.account_id
LEFT JOIN online_transfer 
    ON account_transaction.transaction_id = online_transfer.transaction_id;

DROP VIEW IF EXISTS loan_view;

CREATE VIEW loan_view AS 
(SELECT 
    loan.id AS loan_id,
    customer_account.customer_id AS customer_id,
    loan.start_date AS approved_date,
    loan.loan_amount AS loan_amount,
    'online' AS state, 
    customer_account.branch_code AS branch_code,
    loan_plan.name AS plan_name,
    loan_plan.id AS plan_id
FROM loan
INNER JOIN loan_plan ON loan.plan_id = loan_plan.id
INNER JOIN customer_account ON loan.connected_account = customer_account.account_id
WHERE loan.id IN (SELECT loan_id FROM online_loan_view) 
UNION
SELECT 
    loan.id AS loan_id,
    customer_account.customer_id AS customer_id,
    loan.start_date AS approved_date,
    loan.loan_amount AS loan_amount,
	branch_loan.state AS state,
    customer_account.branch_code AS branch_code,
    loan_plan.name AS plan_name,
    loan_plan.id AS plan_id
FROM loan
INNER JOIN loan_plan ON loan.plan_id = loan_plan.id
INNER JOIN branch_loan ON loan.id = branch_loan.loan_id
INNER JOIN customer_account ON loan.connected_account = customer_account.account_id)
ORDER BY loan_id ASC;

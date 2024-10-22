use bank_database;

DROP VIEW IF EXISTS loan_view;

CREATE VIEW loan_view AS 
SELECT  loan.loan_id,
        loan.customer_id,
        request_date,
        loan_amount,
        state,
        approved_date,
        customer_account.branch_code,
        loan_plan.plan_name,
        loan.plan_id
FROM    (loan INNER JOIN loan_plan ON loan.plan_id = loan_plan.plan_id) 
            INNER JOIN customer_account ON loan.connected_account = customer_account.account_id;

DROP VIEW IF EXISTS transaction_view;

CREATE VIEW transaction_view AS 
SELECT 	amount,
        trans_timestamp,
        reason,
        trans_type,
        trans_method,
        branch_code
FROM 	account_transaction INNER JOIN customer_account 
		ON customer_account.account_id = account_transaction.accnt;
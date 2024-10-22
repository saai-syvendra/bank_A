
-- DROP FUNCTION IF EXISTS AccountExists;

DELIMITER $$

CREATE FUNCTION AccountExists(
    p_account_id INT

) RETURNS BOOLEAN

DETERMINISTIC
BEGIN
    DECLARE v_exists BOOLEAN;

    -- Check if the account exists
    SELECT COUNT(*) > 0 INTO v_exists
    FROM Customer_Account
    WHERE account_id = p_account_id
    AND status = 'active';

    RETURN v_exists;
END$$

DELIMITER ;

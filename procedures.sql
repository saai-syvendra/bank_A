DELIMITER $$

CREATE PROCEDURE createPerson(
    IN nic CHAR(12),
    IN first_name VARCHAR(50),
    IN last_name VARCHAR(50),
    IN mobile CHAR(10),
    IN email VARCHAR(50),
    IN dob DATE,
    IN address VARCHAR(300),
    IN customerId INT
)
BEGIN
    -- Start transaction
    START TRANSACTION;

    -- Insert into the Person table
    INSERT INTO Person (nic, first_name, last_name, mobile, email, dob, address, customer_id)
    VALUES (nic, first_name, last_name, mobile, email, dob, address, customerId);

    -- Commit transaction
    COMMIT;
END$$

CREATE PROCEDURE createOrganisation(
    IN brc CHAR(6),
    IN org_name VARCHAR(50),
    IN address VARCHAR(300),
    IN telephone CHAR(10),
    IN email VARCHAR(50),
    IN customerId INT
)
BEGIN
    -- Start transaction
    START TRANSACTION;

    -- Insert into the Organisation table
    INSERT INTO Organisation (brc, org_name, address, telephone, email, customer_id)
    VALUES (brc, org_name, address, telephone, email, customerId);

    -- Commit transaction
    COMMIT;
END$$

DELIMITER ;

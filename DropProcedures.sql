SELECT CONCAT('DROP PROCEDURE IF EXISTS ', routine_name, ';')
FROM information_schema.routines
WHERE routine_type = 'PROCEDURE'
AND routine_schema = 'bank_database';


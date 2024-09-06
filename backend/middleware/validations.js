import { body, validationResult } from "express-validator";

const handleValidationErrors = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateAccountRequest = [
    body("customerId").isNumeric({ min: 0 }).withMessage("Invalid customer ID"),
    body("accountType")
        .isIn(["saving", "checking"])
        .withMessage("Invalid account type"),
    body("accountBalance").isFloat({ min: 0 }),
    handleValidationErrors,
];

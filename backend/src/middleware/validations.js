import { body, validationResult } from "express-validator";

const handleValidationErrors = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateAccountRequest = [
    body("balance").isNumeric(),
    body("customerId").isNumeric({ min: 0 }).withMessage("Invalid customer ID"),
    body("accountType")
        .isIn(["saving", "checking"])
        .withMessage("Invalid account type"),
    body("balance").isFloat({ min: 0 }),
    handleValidationErrors,
];

// Define validation rules for an individual
const validateIndividual = [
    body("customerDetails.nic")
        .isLength({ min: 12, max: 12 })
        .withMessage("NIC must be 12 characters long"),
    body("customerDetails.firstName")
        .notEmpty()
        .withMessage("First name is required"),
    body("customerDetails.lastName")
        .notEmpty()
        .withMessage("Last name is required"),
    body("customerDetails.mobile")
        .isLength({ min: 10, max: 10 })
        .withMessage("Invalid mobile number"),
    body("customerDetails.email")
        .isEmail()
        .withMessage("Invalid email address"),
    body("customerDetails.dob")
        .isDate()
        .withMessage("Date of birth is required and must be a valid date"),
    body("customerDetails.age")
        .isNumeric({ min: 0 })
        .withMessage("Age must be a valid number"),
    body("customerDetails.address")
        .isString()
        .withMessage("Address must be a string"),
];

// Define validation rules for an organisation
const validateOrganisation = [
    body("customerDetails.brc")
        .isLength({ min: 6, max: 6 })
        .withMessage("BRC must be 6 characters long"),
    body("customerDetails.orgName")
        .notEmpty()
        .withMessage("Organization name is required"),
    body("customerDetails.address")
        .isString()
        .withMessage("Address must be a string"),
    body("customerDetails.telephone")
        .isLength({ min: 10, max: 10 })
        .withMessage("Telephone must be 10 digits long"),
    body("customerDetails.email")
        .isEmail()
        .withMessage("Invalid email address"),
];

// Middleware to handle conditional validation
export const validateCreateCustomer = [
    // Validate cType
    body("cType")
        .isIn(["individual", "organisation"])
        .withMessage(
            "Invalid customer type. Must be 'individual' or 'organisation'"
        ),

    // Middleware to apply conditional validation
    async (req, res, next) => {
        const { cType } = req.body;

        if (cType === "individual") {
            await Promise.all(
                validateIndividual.map((validator) => validator.run(req))
            );
        } else if (cType === "organisation") {
            await Promise.all(
                validateOrganisation.map((validator) => validator.run(req))
            );
        }

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    },
];

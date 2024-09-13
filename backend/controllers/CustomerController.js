import CustomerModel from "../models/CustomerModel.js";

const getCustomer = async (req, res) => {
    const { customerId } = req.body;
    try {
        const customer = await CustomerModel.getCustomer(customerId);
        return res.json({ customer });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error.message });
    }
};

const getCustomerNames = async (req, res) => {
    try {
        const customerDetail = await CustomerModel.getAllCustomers();

        const customers = [];

        for (const customer of customerDetail) {
            console.log(customer);
            const c = {};
            c["customerId"] = customer["customer_id"];
            c["customerType"] = customer["c_type"];
            if (customer["c_type"] === "individual") {
                c["name"] =
                    customer["first_name"] + " " + customer["last_name"];
            } else if (customer["c_type"] === "organisation") {
                c["name"] = customer["org_name"];
            }
            console.log(c);
            customers.push(c);
        }
        return res.json({ customers });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error.message });
    }
};

const createCustomer = async (req, res) => {
    const { cType, customerDetails } = req.body;
    try {
        await CustomerModel.createCustomer(cType, customerDetails);
        return res.json({ message: "Customer created successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error.message });
    }
};

export default { getCustomer, getCustomerNames, createCustomer };

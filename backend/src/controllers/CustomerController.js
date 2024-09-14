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

const getCustomerDetail = async (req, res) => {
    const { id } = req.user;
    try {
        const customer = await CustomerModel.getCustomer(id);

        const customerDetail = {
            firstName: customer["first_name"],
            lastName: customer["last_name"],
            mobile: customer["mobile"],
            address: customer["address"],
            email: customer["email"],
            dob: customer["dob"],
            nic: customer["nic"],
        };

        return res.json(customerDetail);
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
            const c = {};
            c["customerId"] = customer["customer_id"];
            c["customerType"] = customer["c_type"];
            if (customer["c_type"] === "individual") {
                c["name"] =
                    customer["first_name"] + " " + customer["last_name"];
            } else if (customer["c_type"] === "organisation") {
                c["name"] = customer["org_name"];
            }
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

const updateCustomerDetail = async (req, res) => {
    const { id } = req.user;
    const data = req.body;
    try {
        const updatedCustomer = {
            first_name: data.firstName,
            last_name: data.lastName,
            mobile: data.mobile,
            address: data.address,
            email: data.email,
            dob: data.dob,
            nic: data.nic,
        };

        await CustomerModel.updateCustomer(id, updatedCustomer);

        res.status(200).json({ message: "Employee details updated" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

export default {
    getCustomer,
    getCustomerNames,
    createCustomer,
    getCustomerDetail,
    updateCustomerDetail,
};

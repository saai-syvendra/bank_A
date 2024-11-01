import CustomerModel from "../models/CustomerModel.js";
import EmployeeModel from "../models/EmployeeModel.js";
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
    const { customerType } = req.query;

    const customers = [];

    for (const customer of customerDetail) {
      const c = {};
      c["customerId"] = customer["customer_id"];
      c["customerType"] = customer["c_type"];
      if (customer["c_type"] === "individual") {
        c["name"] = customer["first_name"] + " " + customer["last_name"];
      } else if (customer["c_type"] === "organisation") {
        c["name"] = customer["name"];
      }

      if (!customerType || customer["c_type"] === customerType) {
        customers.push(c);
      }
    }
    return res.json({ customers });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const createCustomer = async (req, res) => {
  const { cType, customerDetails: data } = req.body;
  const customerDetails = {
    email: data.email || null,
    address: data.address || null,
    mobile: data.mobile || null,
    nic: data.nic || null,
    firstName: data.firstName || null,
    lastName: data.lastName || null,
    dob: data.dob || null,
    brc: data.brc || null,
    name: data.name || null,
  };
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
  const updatedCustomer = {
    email: data.email || null,
    address: data.address || null,
    mobile: data.mobile || null,
    firstName: data.firstName || null,
    lastName: data.lastName || null,
    dob: data.dob || null,
  };
  try {
    await CustomerModel.updateCustomer(id, updatedCustomer);

    res.status(200).json({ message: "Employee details updated" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const getCustomerDetailsFromAccountNo = async (req, res) => {
  const { accountNo } = req.body;
  let customerID;
  let customerName;
  try {
    customerID = await CustomerModel.getCustomerIDFromAccountNo(accountNo);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
  try {
    const customer = await CustomerModel.getCustomer(customerID);
    if (customer["c_type"] === "individual") {
      customerName = customer["first_name"] + " " + customer["last_name"];
    } else if (customer["c_type"] === "organisation") {
      customerName = customer["name"];
    }
    const customerDetail = {
      name: customerName,
      mobile: customer["mobile"],
      address: customer["address"],
      email: customer["email"],
    };
    res.status(200).json(customerDetail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const getthisBranchCustomers = async (req, res) => {
  const { id: employeeId } = req.user; 
  const branchCode = await EmployeeModel.getEmployeeBranch(employeeId); 
  
  try {
    const summary = await CustomerModel.getthisBranchCustomers(branchCode); 
    const modifiedData = summary.map(customer => {
      if (customer.c_type === 'individual') {
        customer.name = `${customer.first_name} ${customer.last_name}`;
      }
      // Remove unnecessary fields
      delete customer.nic;
      delete customer.first_name;
      delete customer.last_name;
      
      return customer;
    });
    res.status(200).send(modifiedData); 
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}
export default {
  getCustomer,
  getCustomerNames,
  createCustomer,
  getCustomerDetail,
  updateCustomerDetail,
  getCustomerDetailsFromAccountNo,
  getthisBranchCustomers,
};

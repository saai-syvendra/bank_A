import EmployeeModel from "../models/EmployeeModel.js";
import CustomerModel from "../models/CustomerModel.js";

const getEmployeeDetail = async (req, res) => {
    const { id } = req.user;
    try {
        const employee = await EmployeeModel.getEmployee(id);
        const customerDetail = await CustomerModel.getCustomer(
            employee.customer_id
        );

        const employeeDetail = {
            firstName: customerDetail["first_name"],
            lastName: customerDetail["last_name"],
            mobile: customerDetail["mobile"],
            address: customerDetail["address"],
            position: employee["position"],
            experience: employee["experience"],
            email: customerDetail["email"],
            dob: customerDetail["dob"],
            nic: customerDetail["nic"],
        };
        res.status(200).json(employeeDetail);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateEmployeeDetail = async (req, res) => {
    const { id } = req.user;
    const data = req.body;
    try {
        const updatedEmployee = {
            position: data.position,
            experience: data.experience,
        };

        await EmployeeModel.updateEmployee(id, updatedEmployee);

        const employee = await EmployeeModel.getEmployee(id);

        const updatedCustomer = {
            first_name: data.firstName,
            last_name: data.lastName,
            mobile: data.mobile,
            address: data.address,
            email: data.email,
            dob: data.dob,
            nic: data.nic,
        };

        await CustomerModel.updateCustomer(
            employee.customer_id,
            updatedCustomer
        );

        res.status(200).json({ message: "Employee details updated" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

export default { getEmployeeDetail, updateEmployeeDetail };

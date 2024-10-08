import EmployeeModel from "../models/EmployeeModel.js";

const getEmployeeDetail = async (req, res) => {
  const { id } = req.user;
  try {
    const employee = await EmployeeModel.getEmployee(id);

    const employeeDetail = {
      firstName: employee["first_name"],
      lastName: employee["last_name"],
      mobile: employee["mobile"],
      address: employee["address"],
      position: employee["position"],
      experience: employee["experience"],
      email: employee["email"],
      dob: employee["dob"],
      nic: employee["nic"],
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
      first_name: data.firstName,
      last_name: data.lastName,
      mobile: data.mobile,
      address: data.address,
      experience: data.experience,
    };

    await EmployeeModel.updateEmployee(id, updatedEmployee);

    res.status(200).json({ message: "Employee details updated" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export default { getEmployeeDetail, updateEmployeeDetail };

import FdModel from "../models/FdModel.js";

const getThisCustomerFds = async (req, res) => {
    const { id: customerId } = req.user;
    try {
        const fds = await FdModel.getCustomerFds(customerId);

        const filteredFds = fds.map((fd) => ({
            fd_id: fd.fd_id,
            starting_date: fd.starting_date,
            amount: fd.amount,
            maturity_date: fd.maturity_date,
            account_number: fd.account_number,
            branch_code: fd.branch_code,
        }));

        res.json({ fds: filteredFds });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export default { getThisCustomerFds };

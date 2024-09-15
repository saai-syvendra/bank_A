import FdModel from "../models/FdModel.js";

const getCustomerFds = async (req, res) => {
    const { customerId } = req.body;
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
        res.status(400).send(error.message);
    }
};
export default { getCustomerFds };

import React from "react";

const TransactionCard = ({ transaction, showFrom = false }) => {
    return (
        <div className="shadow-lg p-4 mx-20 rounded-lg bg-white mb-5 ">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                    Transaction ID: {transaction.transaction_id}
                </h2>
                <span
                    className={`px-2 py-1 rounded-full text-white ${
                        transaction.method === "online"
                            ? "bg-blue-500"
                            : transaction.method === "atm-cdm"
                            ? "bg-green-500"
                            : "bg-gray-500"
                    }`}
                >
                    {transaction.method}
                </span>
            </div>
            {showFrom && (
                <p className="text-gray-800 text-lg">
                    From: {transaction.from}
                </p>
            )}
            <p
                className={`text-gray-800 font-semibold ${
                    transaction.amount > 0 ? "text-green-600" : "text-red-600"
                }`}
            >
                Amount: Rs. {transaction.amount.toFixed(2)}
            </p>
            {transaction.to && (
                <p className="text-gray-600">To: {transaction.to}</p>
            )}
            <p className="text-gray-600">
                Date: {new Date(transaction.date).toLocaleString()}
            </p>
            <p className="text-gray-600">Reason: {transaction.reason}</p>
        </div>
    );
};

export default TransactionCard;

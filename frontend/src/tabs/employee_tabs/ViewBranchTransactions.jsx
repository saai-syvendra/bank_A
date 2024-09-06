import React from "react";
import TransactionCard from "../../components/TransactionCard";

const ViewBranchTransactions = () => {
    const transactions = [
        {
            transaction_id: "TXN12345678",
            from: "ACC123456789",
            to: "ACC987654321",
            amount: 1500.5,
            date: "2024-08-28T14:55:00Z",
            reason: "Payment for services",
            method: "online",
        },
        {
            transaction_id: "TXN12345678",
            from: "ACC123456789",
            amount: 1750.5,
            date: "2024-08-27T10:45:00Z",
            reason: "Random deposit",
            method: "atm-cdm",
        },
        {
            transaction_id: "TXN12345678",
            from: "ACC123456789",
            amount: 1500.5,
            date: "2024-08-24T12:45:00Z",
            reason: "Savings Interest for August",
            method: "server",
        },
        {
            transaction_id: "TXN12345678",
            from: "ACC123456789",
            amount: -2750.0,
            date: "2024-08-23T11:45:00Z",
            reason: "Random withdrawal",
            method: "atm-cdm",
        },
    ];

    return (
        <div className="p-6 ">
            {transactions.map((transaction) => (
                <TransactionCard
                    transaction={transaction}
                    showFrom={true}
                    key={transaction.transaction_id}
                />
            ))}
        </div>
    );
};

export default ViewBranchTransactions;

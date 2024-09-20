import React, { useEffect, useState, useCallback } from "react";
import TransactionCard from "../../components/TransactionCard";
import { callGetCustomerAccountTransactions } from "../../api/AccountApi";
import { toast } from "sonner";

import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "../../components/ui/tabs";

const ViewTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedTransactions = await callGetCustomerAccountTransactions();
            setTransactions(fetchedTransactions);
        } catch (error) {
            toast.error(
                error.message || "Failed to fetch transactions"
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (transactions.length === 0) {
        return <div>No transactions found.</div>;
    }

    return (
        <div className="p-6">
            <Tabs defaultValue={transactions[0][0].account_number}>
                <TabsList>
                    {transactions.map((accountTransactions, index) => (
                        <TabsTrigger key={index} value={accountTransactions[0].account_number}>
                            {accountTransactions[0].account_number}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {transactions.map((accountTransactions, index) => (
                    <TabsContent key={index} value={accountTransactions[0].account_number}>
                        {accountTransactions.map((transaction) => (
                            <TransactionCard
                                transaction={transaction}
                                key={transaction.transaction_id}
                                showFrom={transaction.from !== null && transaction.from !== accountTransactions[0].account_number}
                                showTo={transaction.to !== null && transaction.to !== accountTransactions[0].account_number}
                                />
                        ))}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default ViewTransactions;
/*


*/
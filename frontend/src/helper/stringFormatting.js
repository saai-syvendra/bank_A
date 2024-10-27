export const formatAccountDetails = (account) => {
  //Replace first letter of account_type with uppercase
  account.account_type =
    account.account_type.charAt(0).toUpperCase() +
    account.account_type.slice(1);
  return `${account.account_type} - ${account.account_number} - Rs. ${Number(
    account.balance
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

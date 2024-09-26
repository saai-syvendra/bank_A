export const formatAccountDetails = (account) => {
  //Replace first letter of account_type with uppercase
  account.account_type =
    account.account_type.charAt(0).toUpperCase() +
    account.account_type.slice(1);
  return `${account.account_type} - ${account.account_number} - Rs. ${account.balance}`;
};

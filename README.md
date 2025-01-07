# Bank Management System

<img src="https://github.com/user-attachments/assets/11651dfd-5416-4887-8641-7fe27cc29e7e" alt="Bank_A_logo" width="200"/>




This project is a Bank Management System (BMS) that enables users to manage their bank accounts, apply for loans, and make installment payments. Developed as part of the CS3043 Database Systems module, the system leverages React for the frontend and Node.js with Express for the backend, with MySQL as the database.

## Features

### Account Management
- Supports **Savings** and **Checking** accounts.
- Enables **Fixed Deposit (FD)** setup with annual interest rates.
- Implements account restrictions based on account type (e.g., withdrawal limits, minimum balance).

### Fund Transfers and Withdrawals
- Allows **same-bank fund transfers** for customers through an online portal.
- Supports **ATM withdrawals** for Savings and Checking account holders.

### Loan Processing
- Supports **Business and Personal Loan Applications**:
  - **Branch Loans**: Initiated and managed by bank employees.
  - **Online Loans**: Allows customers with Fixed Deposits (FDs) to borrow up to 60% of the FD value (maximum loan amount: 500,000).
- Calculates **monthly installments** based on loan amount, interest rate, and duration.

### Reporting
- **Branch-wise reports** on total transactions and overdue loan installments, accessible by branch managers.

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn
- **Backend**: Node.js with Express
- **Database**: MySQL, emphasizing ACID compliance, primary and foreign keys, and indexing.

## Getting Started

To get started with the Bank Management System, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd bank_A
2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
3. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
4. **Set up the database**:
- Create a MySQL database.
- Import the provided SQL schema file (`updated_model.sql`) located in the repository.
- Configure the database connection:
   - Update the database configuration in `backend/config/database.js` with your MySQL credentials.
5. **Start the backend server**:
     ```bash
     cd ../backend
     npm start
6. **Start the frontend development server**:
    ```bash
    cd ../frontend
    npm run dev

7. **Open the application**:

- Open http://localhost:5173 in your browser to access the application.

## Additional Information
- The project description, tables, and entity-relationship diagram are included in the repository.
- The tech stack includes Express, React, and MySQL.
- For more details, refer to the documentation or open an issue in the repository if you encounter any issues.






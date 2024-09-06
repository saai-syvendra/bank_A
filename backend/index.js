import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoute from "./routes/UserRoute.js";
// import customerRoute from "./routes/CustomerRoute.js";
// import accountRoute from "./routes/AccountRoute.js";
// import loanRoute from "./routes/LoanRoute.js";
// import reportRoute from "./routes/ReportRoute.js";
import { authenticateJWT, authorizeRole } from "./middleware/auth.js";
dotenv.config();

const app = express();
app.use(
    cors({
        origin: "http://localhost:5173", // replace with your frontend URL
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

app.use("/user", userRoute);
// app.use("/customer", authenticateJWT, customerRoute);
// app.use("/account", authenticateJWT, accountRoute);
// app.use("/loan", authenticateJWT, loanRoute);
// app.use("/report", authenticateJWT, reportRoute);

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

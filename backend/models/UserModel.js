import bcrypt from "bcrypt";
import { pool } from "../middleware/constants.js";

const getUserByUsername = async (username) => {
    const [row] = await pool.query(
        `
          SELECT User_Role.ID, User_Role.Username, User_Role.Hashed_Pwd, User_Role.Employee_ID, User_Role.Customer_ID, Roles.Role_Name
          FROM User_Role, Roles
          WHERE User_Role.Role_ID=Roles.ID AND Username=?;
      `,
        [username]
    );
    const user = row[0];
    if (!user) throw new Error("Invalid username");

    return user;
};

const verifyUser = async (username, password) => {
    const user = await getUserByUsername(username);

    const isPasswordValid = await bcrypt.compare(password, user["Hashed_Pwd"]);
    if (!isPasswordValid) throw new Error("Invalid password");
    // console.log(user);

    return user;
};

// Verify OTP
const verifyOtp = async (userId, otp) => {
    const [row] = await pool.query(
        `
          SELECT *
          FROM Otps
          WHERE User_ID=?;
      `,
        [userId]
    );
    const otpDetails = row[0];
    if (!otpDetails) throw new Error("OTP not found");

    if (otpDetails["Wrong_Count"] >= 3)
        throw new Error("OTP verification failed 3 times");

    if (otp != otpDetails["Otp"]) {
        await pool.query(
            `
            UPDATE Otps SET Wrong_Count = Wrong_Count+1 WHERE User_Id = ?    
        `,
            [userId]
        );
        throw new Error("OTP incorrect");
    } else {
        await pool.query(
            `
            DELETE FROM Otps WHERE User_ID = ?;    
        `,
            [userId]
        );
    }
};

const deleteUserOtps = async (userId) => {
    await pool.query(
        `
        DELETE FROM Otps WHERE User_ID = ?`,
        [userId]
    );
};

const insertOtp = async (userId, otp) => {
    const expiresAt = await new Date(Date.now() + 5 * 60 * 1000);
    await pool.query(
        `INSERT INTO Otps (User_Id, Otp, Expires_At) VALUES
        (?, ?, ?)`,
        [userId, otp, expiresAt]
    );
};

export default {
    getUserByUsername,
    verifyUser,
    verifyOtp,
    deleteUserOtps,
    insertOtp,
};

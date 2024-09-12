import bcrypt from "bcrypt";
import { pool } from "../middleware/constants.js";

const getUserByUsername = async (username) => {
    const [row] = await pool.query(
        `
          SELECT *
          FROM User_Account
          WHERE username=?;
      `,
        [username]
    );
    const user = row[0];
    if (!user) throw new Error("Invalid username");

    return user;
};

const verifyUser = async (username, password) => {
    const user = await getUserByUsername(username);

    const isPasswordValid = await bcrypt.compare(password, user["hashed_pwd"]);
    if (!isPasswordValid) throw new Error("Invalid password");
    // console.log(user);

    return user;
};

// Verify OTP
const verifyOtp = async (username, otp) => {
    const [row] = await pool.query(
        `
          SELECT *
          FROM Otps
          WHERE username=?;
      `,
        [username]
    );
    const otpDetails = row[0];
    if (!otpDetails) throw new Error("OTP not found");

    if (otpDetails["wrong_count"] >= 3)
        throw new Error("OTP verification failed 3 times");

    if (otp != otpDetails["otp"]) {
        await pool.query(
            `
            UPDATE Otps SET wrong_count = wrong_count+1 WHERE username = ?    
        `,
            [username]
        );
        throw new Error("OTP incorrect");
    } else {
        await pool.query(
            `
            DELETE FROM Otps WHERE username = ?;    
        `,
            [username]
        );
    }
};

const deleteUserOtps = async (username) => {
    await pool.query(
        `
        DELETE FROM Otps WHERE username = ?`,
        [username]
    );
};

const insertOtp = async (username, otp) => {
    const expiresAt = await new Date(Date.now() + 5 * 60 * 1000);
    await pool.query(
        `INSERT INTO Otps (username, otp, expires_at) VALUES
        (?, ?, ?)`,
        [username, otp, expiresAt]
    );
};

export default {
    getUserByUsername,
    verifyUser,
    verifyOtp,
    deleteUserOtps,
    insertOtp,
};

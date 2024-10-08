import bcrypt from "bcrypt";
import { pool } from "../middleware/constants.js";

const getUserByUsername = async (username) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [row] = await connection.query(
      `
        SELECT *
        FROM User_Account
        WHERE email = ?;
      `,
      [username]
    );
    const user = row[0];
    if (!user) throw new Error("Invalid username");

    await connection.commit();
    return user;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const verifyUser = async (username, password) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const user = await getUserByUsername(username);
    const isPasswordValid = await bcrypt.compare(password, user["hashed_pwd"]);
    if (!isPasswordValid) throw new Error("Invalid password");

    await connection.commit();
    return user;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const verifyOtp = async (username, otp) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [row] = await connection.query(
      `
        SELECT *
        FROM Otps
        WHERE email = ?;
      `,
      [username]
    );
    const otpDetails = row[0];
    console.log(username, otpDetails);
    if (!otpDetails) throw new Error("OTP not found");

    if (otpDetails["wrong_count"] >= 3)
      throw new Error("OTP verification failed 3 times");

    if (otpDetails["expires_at"] < new Date()) {
      await connection.query(
        `
          DELETE FROM Otps WHERE email = ?;    
        `,
        [username]
      );
      throw new Error("OTP expired");
    }

    if (otp != otpDetails["otp"]) {
      await connection.query(
        `
          UPDATE Otps SET wrong_count = wrong_count + 1 WHERE email = ?    
        `,
        [username]
      );
      throw new Error("OTP incorrect");
    } else {
      await connection.query(
        `
          DELETE FROM Otps WHERE email = ?;    
        `,
        [username]
      );
    }

    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const deleteUserOtps = async (username) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `
        DELETE FROM Otps WHERE email = ?;
      `,
      [username]
    );

    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const insertOtp = async (username, otp) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await connection.query(
      `
        INSERT INTO Otps (email, otp, expires_at) VALUES (?, ?, ?);
      `,
      [username, otp, expiresAt]
    );

    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export default {
  getUserByUsername,
  verifyUser,
  verifyOtp,
  deleteUserOtps,
  insertOtp,
};

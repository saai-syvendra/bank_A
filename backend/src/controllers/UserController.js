import jwt from "jsonwebtoken";
import crypto from "crypto";

import { transporter } from "../middleware/constants.js";
import UserModel from "../models/UserModel.js";

const generateAndEmailOtp = async (username, reason) => {
  // If current user has preexisting OTP verification remove them

  await UserModel.deleteUserOtps(username);

  const otp = crypto.randomInt(100000, 999999).toString();
  let message = {
    from: "syvendratech@gmail.com",
    to: username,
    subject: "One Time Passowrd",
    html: `A one time password has been requested by you for the following reason: ${reason}
        <br><br> One Time Password: <b>${otp}</b>`,
  };

  // transporter
  //     .sendMail(message)
  //     .then(async (info) => {
  //         await UserModel.insertOtp(username, otp);
  //         console.log(`\nOTP for ${username} is ${otp}`);
  //     })
  //     .catch((error) => {
  //         console.log(error);
  //         throw new Error("Error in sending OTP!");
  //     });

  await UserModel.insertOtp(username, otp);
  console.log(`\nOTP for ${username} is ${otp}`);
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // console.log(username, password);
    const jwtSecret = process.env.JWT_SECRET;
    const user = await UserModel.verifyUser(username, password);
    await generateAndEmailOtp(username, "Login verification");
    const token = jwt.sign({ username: user["email"] }, jwtSecret, {
      expiresIn: "5m",
    });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000, // 5 minutes
    });
    return res.json({ message: "OTP Sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const loginOtp = async (req, res) => {
  const { otp } = req.body;
  try {
    // console.log(username, password);
    const jwtSecret = process.env.JWT_SECRET;
    const { token: authToken } = req.cookies;

    if (!authToken) return res.sendStatus(401);

    let username;
    jwt.verify(authToken, jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      username = user.username;
    });

    await UserModel.verifyOtp(username, otp);

    const user = await UserModel.getUserByUsername(username);
    const id = user["user_id"];

    const token = jwt.sign(
      {
        role: user["role"],
        id,
        username: user["email"],
      },
      jwtSecret,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    // console.log("Token: ", token);
    return res.json({ message: "OTP Verified", role: user["role"] });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const verify = async (req, res) => {
  const { roles } = req.body;
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const { token: authToken } = req.cookies;

    if (!authToken) {
      return res.status(401).send({ message: "Not logged in" });
    }

    // Wrapping jwt.verify in a Promise to handle it asynchronously
    const user = await new Promise((resolve, reject) => {
      jwt.verify(authToken, jwtSecret, (err, user) => {
        if (err) {
          return reject(err);
        }
        resolve(user);
      });
    });
    const role = user.role;

    if (!role) {
      return res.status(403).send({ message: "OTP verification needed" });
    }

    if (!roles.includes(role)) {
      return res.status(403).send({ message: "Access denied" });
    }

    return res.json({
      role: role,
      message: "Access granted",
    });
  } catch (error) {
    console.log(error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.sendStatus(403);
    }
    return res.status(500).send({ message: error.message });
  }
};

const authUser = async (req, res) => {
  return res.json({ message: "User authenticated" });
};

const userExpiration = async (req, res) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const { token: authToken } = req.cookies;

    const user = await new Promise((resolve, reject) => {
      jwt.verify(authToken, jwtSecret, (err, user) => {
        if (err) {
          return reject(err);
        }
        resolve(user);
      });
    });
    const expirationTime = user.exp * 1000;

    return res.json({ expirationTime });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const sendOtp = async (req, res) => {
  const { username } = req.user;
  const { reason } = req.body;
  try {
    await generateAndEmailOtp(username, reason);
    return res.json({ message: "OTP Sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { username } = req.user;
  const { otp } = req.body;
  try {
    await UserModel.verifyOtp(username, otp);
    return res.json({ message: "OTP Verified" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};

export default {
  login,
  loginOtp,
  logout,
  verify,
  authUser,
  userExpiration,
  sendOtp,
  verifyOtp,
};

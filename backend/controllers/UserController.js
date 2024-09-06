import jwt from "jsonwebtoken";
import crypto from "crypto";

import { transporter } from "../middleware/constants.js";
import UserModel from "../models/UserModel.js";

const generateAndEmailOtp = async (userId, email, reason) => {
    // If current user has preexisting OTP verification remove them

    await UserModel.deleteUserOtps(userId);

    const otp = crypto.randomInt(100000, 999999).toString();
    let message = {
        from: "syvendratech@gmail.com",
        to: email,
        subject: "One Time Passowrd",
        html: `A one time password has been requested by you for the following reason: ${reason}
        <br><br> One Time Password: <b>${otp}</b>`,
    };

    transporter
        .sendMail(message)
        .then(async (info) => {
            await UserModel.insertOtp(userId, otp);
            console.log(`\nOTP for ${email} is ${otp}`);
        })
        .catch((error) => {
            console.log(error);
            throw new Error("Error in sending OTP!");
        });
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // console.log(username, password);
        const jwtSecret = process.env.JWT_SECRET;
        const user = await UserModel.verifyUser(username, password);
        await generateAndEmailOtp(user["ID"], username, "Login verification");
        const token = jwt.sign(
            { userId: user["ID"], username: user["Username"] },
            jwtSecret,
            {
                expiresIn: "5m",
            }
        );
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

        let userId;
        let username;
        jwt.verify(authToken, jwtSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            userId = user.userId;
            username = user.username;
        });

        await UserModal.verifyOtp(userId, otp);

        const user = await UserModel.getUserByUsername(username);
        const id =
            user["Role_Name"] === "customer"
                ? user["Customer_Id"]
                : user["Employee_Id"];

        const token = jwt.sign(
            {
                userId: user["ID"],
                role: user["Role_Name"],
                id,
                username: user["Username"],
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
        return res.json({ message: "OTP Verified", role: user["Role_Name"] });
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

        let userId;
        let username;

        // Wrapping jwt.verify in a Promise to handle it asynchronously
        const user = await new Promise((resolve, reject) => {
            jwt.verify(authToken, jwtSecret, (err, user) => {
                if (err) {
                    return reject(err);
                }
                resolve(user);
            });
        });

        userId = user.userId;
        username = user.username;

        const userDetails = await UserModel.getUserByUsername(username);
        if (!roles.includes(userDetails["Role_Name"])) {
            return res.status(403).send({ message: "Access denied" });
        }

        return res.json({ message: "Access granted" });
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

export default { login, loginOtp, logout, verify, authUser, userExpiration };

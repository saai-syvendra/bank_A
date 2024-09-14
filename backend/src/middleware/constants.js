import mysql from "mysql2";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const pool = mysql
    .createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    })
    .promise();

let config = {
    service: "gmail", // your email domain
    auth: {
        user: process.env.GMAIL_APP_USER,
        pass: process.env.GMAIL_APP_PWD,
    },
};

export const transporter = nodemailer.createTransport(config);

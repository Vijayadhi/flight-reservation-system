import { v4 as uuid } from "uuid";
import nodemailer from 'nodemailer';


const generateUUID = () => {
    return uuid()
}

export { generateUUID }

// mailer.js

// Configure the transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can change this to your preferred email service
    auth: {
        user: process.env.EMAIL_USER, // Your email address (use environment variables)
        pass: process.env.EMAIL_PASS, // Your email password or app password (use environment variables)
    },
});

/**
 * Sends an email to the specified recipient.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text body of the email.
 * @param {string} html - The HTML body of the email (optional).
 * @returns {Promise} - A promise that resolves if the email is sent successfully.
 */
export const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to, // Recipient address
        subject, // Subject line
        // text, // Plain text body
        html, // HTML body (optional)
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return reject(error);
            }
            console.log('Email sent:', info.response);
            resolve(info);
        });
    });
};

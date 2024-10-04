import auth from "../common/auth.js"; // Assuming this module contains password hashing logic
import userModel from "../models/userModel.js";
import config from "../utils/config.js";
import { sendEmail } from "../utils/helper.js";
import fs from 'fs';
// import emailTemplate from '../emailTemplates/userRegistrationSuccess.html'

const createUser = async (req, res) => {
    try {
        let formData = req.body;

        // Check if all required fields are present
        if (!formData || !formData.email || !formData.password || !formData.confirm_password) {
            return res.status(400).send({
                message: "Missing required fields: email, password, or confirm password",
            });
        }

        // Check if password and confirm password match
        if (formData.password !== formData.confirm_password) {
            return res.status(400).send({
                message: "Password and confirm password do not match",
            });
        }

        // Check if user already exists
        let user = await userModel.findOne({ email: formData.email });
        if (user) {
            return res.status(400).send({
                message: "User already exists with this email",
            });
        }

        // Hash the password
        formData.password = await auth.hashPassword(formData.password); // Assuming this method exists in auth module

        // Remove confirm_password from formData before saving
        delete formData.confirm_password;

        // Create a new user
        let newUser = await userModel.create(formData);
        const userName = formData.name; // extract the username from the email
        const emailTemplatePath = 'src/emailTemplates/userRegistrationSuccess.html';
        const htmlTemplate = await fs.promises.readFile(emailTemplatePath, 'utf8');
        const replacedHtml = htmlTemplate.replace('{{userName}}', userName);

        // Send a welcome email
        await sendEmail(
            formData.email,
            'Welcome to Our Service',
            replacedHtml
          );

        res.status(201).send({
            message: "User registered successfully",
            user: newUser,
        });
    } catch (err) {
        res.status(500).send({
            message: `Error occurred: ${err.message}`,
        });
    }
};

const getUserByEmail = async (req, res) => {
    try {
        // Fetch the user by email
        let user = await userModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(200).send(user);
    } catch (err) {
        res.status(500).send({ message: `Error occurred: ${err.message}` });
    }
};

const userLogin = async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });
        if (user) {
            if (await auth.hashCompare(req.body.password, user.password)) {
                let payLoad = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
                let token = await auth.createToken(payLoad)
                res.status(200).send({
                    message: "User logged in successfully",
                    token: token,
                    role: user.role,
                    timeout: config.JWT_TIMEOUT

                })
            }
            else {
                res.status(401).send({
                    message: "Invalid password"
                })
            }
        }
        else {
            res.status(404).send({
                message: "User not found"
            })
        }
    }
    catch (err) {
        res.status(500).send({
            message: `Error occurred: ${err.message}`
        })
    }

}

export default { createUser, getUserByEmail, userLogin };

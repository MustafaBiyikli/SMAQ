const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

module.exports = class Email {
    constructor(email) {
        this.from = `SMAQ Team <${process.env.EMAIL_FROM}>`;
        this.to = email;
    }

    newTransport() {
        switch (process.env.NODE_ENV) {
            case "development":
                return nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
            case "production":
                return nodemailer.createTransport({
                    service: "SendGrid",
                    auth: {
                        user: process.env.SENDGRID_USERNAME,
                        pass: process.env.SENDGRID_PASSWORD,
                    },
                });
            default:
                return 1;
        }
    }

    /**
     * Sends a html email from SMAQ to email specified in the constructor
     * @param {String} template name of html file which will show in the email
     * @param {String} subject subject of the email
     */
    async send(template, subject) {
        // HTML path
        var html = fs.readFileSync(`./html/emails/${template}.html`, "utf-8");

        // Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText.fromString(html),
        };

        // Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    /**
     * Sends a text email taken from the contact form to SMAQ
     * @param {String} fname first name from the contact form
     * @param {String} lname last name from the contact form
     * @param {String} email email from the contact form
     * @param {String} category category chosen in the contact form
     * @param {String} message message from the contact form
     */
    async sendContactForm(fname, lname, email, category, message) {
        // Define email options for the contact form
        const mailOptions = {
            from: email,
            to: this.from,
            subject: `User: ${fname} ${lname} Query: ${category}`,
            text: message,
        };

        // Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }
};

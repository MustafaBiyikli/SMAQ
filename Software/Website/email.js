const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

module.exports = class Email {
    constructor(email) {
        this.to = email;
        this.from = `SMAQ Team <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === "production") {
            return nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                },
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

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
};

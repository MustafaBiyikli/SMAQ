/** These functions handle POST requests received at app.js */

const fs = require("fs");
const Email = require("./email");

/** Send the contact form to SMAQ email, posted from contact.js */
exports.contactForm = async (req, res) => {
    const { fname, lname, email, category, message } = req.body;
    try {
        await new Email(email).sendContactForm(
            fname,
            lname,
            email,
            category,
            message
        );
    } catch (err) {
        throw err.message;
    }
    res.json({ message });
};

/** Add username and email into settings.html, posted from settings.js */
exports.userFormAdd = (req, res) => {
    const { username, email } = req.body;

    fs.readFile("./html/settings.html", (err, data) => {
        if (err) throw err.message;
        var [header, users, footer] = data.toString().split("<!--SPLIT-->");
        var newUser = `<li>${username} | ${email}</li>`;
        var fullHTML = header.concat(
            "<!--SPLIT-->",
            users,
            newUser,
            "\n\t\t\t\t\t\t<!--SPLIT-->",
            footer
        );
        fs.writeFile("./html/settings.html", fullHTML, (err) => {
            if (err) throw err.message;
        });
    });

    // For the app
    fs.readFile("./html/app/settings.html", (err, data) => {
        if (err) throw err.message;
        var [header, users, footer] = data.toString().split("<!--SPLIT-->");
        var newUser = `<li>${username} | ${email}</li>`;
        var fullHTML = header.concat(
            "<!--SPLIT-->",
            users,
            newUser,
            "\n\t\t\t\t<!--SPLIT-->",
            footer
        );
        fs.writeFile("./html/app/settings.html", fullHTML, (err) => {
            if (err) throw err.message;
        });
    });

    res.end();
};

/** Remove username and email from settings.html, posted from settings.js */
exports.userFormRemove = (req, res) => {
    const { index } = req.body;

    fs.readFile("./html/settings.html", (err, data) => {
        if (err) throw err.message;
        var [header, users, footer] = data.toString().split("<!--SPLIT-->");
        var userSplit = users.split("\n");
        userSplit = userSplit.slice(1, userSplit.length - 1);
        userSplit.splice(index, 1);
        users = userSplit.join("\n");
        var fullHTML = header.concat(
            "<!--SPLIT-->",
            users,
            "\n\t\t\t\t\t\t<!--SPLIT-->",
            footer
        );
        fs.writeFile("./html/settings.html", fullHTML, (err) => {
            if (err) throw err.message;
        });
    });

    // For the app
    fs.readFile("./html/app/settings.html", (err, data) => {
        if (err) throw err.message;
        var [header, users, footer] = data.toString().split("<!--SPLIT-->");
        var userSplit = users.split("\n");
        userSplit = userSplit.slice(1, userSplit.length - 1);
        userSplit.splice(index, 1);
        users = userSplit.join("\n");
        var fullHTML = header.concat(
            "<!--SPLIT-->",
            users,
            "\n\t\t\t\t<!--SPLIT-->",
            footer
        );
        fs.writeFile("./html/app/settings.html", fullHTML, (err) => {
            if (err) throw err.message;
        });
    });

    res.end();
};

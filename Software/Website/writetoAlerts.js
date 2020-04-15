const fs = require("fs");
const Email = require("./email");

var alertedHigh = [0, 0, 0, 0, 0, 0];
var alertedLow = [0, 0, 0, 0, 0, 0];
var alertedHighTime = [0, 0, 0, 0, 0, 0];
var alertedLowTime = [0, 0, 0, 0, 0, 0];

var errorAlert = [0];
var errorAlertTime = [0, 0];

var successAlert = 0;
var infoAlert = 0;

var refreshTime = 3600;

/**
 * Sends a html email from SMAQ to emails added in the settings
 * @param {String} template name of html file which will show in the email
 * @param {String} subject subject of the email
 */
async function sendEmail(template, subject) {
    try {
        var emailList = getEmailList();
        await new Email(emailList).send(template, subject);
    } catch (err) {
        console.log(err.message);
    }
}

function getEmailList() {
    var data = fs.readFileSync("./html/settings.html", "utf-8");
    var users = data.toString().split("<!--SPLIT-->")[1].split("\n");
    users = users.slice(1, users.length - 1);
    var newEmail = "";
    var emailList = [];
    for (var i = 0; i < users.length; i++) {
        newEmail = users[i].split(" | ")[1].split("</")[0];
        emailList.push(newEmail);
    }
    return emailList;
}

/**
 * Checks if parameters are out of bounds, if yes - sends warning alerts and emails
 * @param {Number} id id of parameter, assign from 0 in ascending order (different id for each parameter)
 * @param {Number} parameter parameter to check from api
 * @param {Number} value value of parameter as an array [low, high]
 * @param {String} message message to display array [low message, high message]
 * @param {String} tStamp time stamp from api
 */
function checkWarning(id, parameter, value, message, tStamp) {
    parameter = parseFloat(parameter);
    if (parameter > value[1]) {
        if (alertedHigh[id] === 0) {
            writeAlert(0, message[1], tStamp);
            sendEmail("warning", "Warning from SMAQ");
            alertedHigh[id] = 1;
            alertedHighTime[id] = new Date().getTime();
        }
    } else if (parameter < value[0]) {
        if (alertedLow[id] === 0) {
            writeAlert(0, message[0], tStamp);
            sendEmail("warning", "Warning from SMAQ");
            alertedLow[id] = 1;
            alertedLowTime[id] = new Date().getTime();
        }
    }
    // Allow same alerts after 1 hour
    if (new Date().getTime() - alertedHighTime[id] > refreshTime * 1000)
        alertedHigh[id] = 0;
    if (new Date().getTime() - alertedLowTime[id] > refreshTime * 1000)
        alertedLow[id] = 0;
}

/**
 * Checks for reestablished connection and sends a success warning
 * @param {String} tStamp time stamp from api
 */
function checkSuccess(tStamp) {
    // Check if there was a hardware error and connection is back
    tStamp = parseInt(tStamp);
    var currentTime = new Date().getTime();
    if (successAlert === 0 && currentTime - tStamp < 1500) {
        writeAlert(3, "Connection established!", tStamp);
        sendEmail("success", "Your SMAQ is working!");
        successAlert = 1;
    }
}

/**
 * Checks data flow stopped and sends an error alert
 * @param {Number} id id of the alert
 * @param {String} tStamp time stamp from api
 */
function checkError(id, tStamp) {
    tStamp = parseInt(tStamp);
    // Hardware error
    var currentTime = new Date().getTime();
    if (currentTime - tStamp > 2000 && errorAlert === 0) {
        writeAlert(1, "Hardware error, try restarting SMAQ", currentTime);
        sendEmail("error", "SMAQ Error!");
        errorAlert[id] = 1;
        errorAlertTime[id] = currentTime;
    }

    // Allow same alert afer 1 hour
    if (new Date().getTime() - errorAlertTime[id] > refreshTime * 1000)
        errorAlert[id] = 0;
}

/**
 * Sends an alert if there is no emails added
 * @param {String} tStamp time stamp from api
 */
function checkInfo(tStamp) {
    var emailList = getEmailList();
    if (emailList.length === 0 && infoAlert === 0) {
        writeAlert(
            2,
            "Add your email address in Settings to receive warnings!",
            tStamp
        );
        infoAlert = 1;
    } else if (emailList.length > 0 && infoAlert === 1) {
        // Remove this alert
        var [header, alerts, footer] = fs
            .readFileSync("./html/alerts.html", "utf-8")
            .split("<!--SPLIT-->");

        var HTML = "";

        var contentAlerts = alerts.split("<div");
        for (i = 0; i < contentAlerts.length; i++) {
            if (contentAlerts[i].length > 200) {
                if (contentAlerts[i].includes('id="info"') === true) {
                    contentAlerts[i] = "";
                } else {
                    HTML = HTML.concat("<div", contentAlerts[i]);
                }
            }
        }

        // Merge html
        var fullHTML = header.concat(
            "<!--SPLIT-->\n\t\t\t\t",
            HTML,
            "<!--SPLIT-->",
            footer
        );

        // Write html
        fs.writeFileSync("./html/alerts.html", fullHTML, "utf-8");

        var [headerApp, alerts, footerApp] = fs
            .readFileSync("./html/app/alerts.html", "utf-8")
            .split("<!--SPLIT-->");

        var [part1, part2] = HTML.split('src="');
        var [before, after] = part2.split("width: 35px");
        var HTMLApp = part1.concat('src="../', before, "width: 25px", after);

        var fullHTMLApp = headerApp.concat(
            "<!--SPLIT-->\n\t\t",
            HTMLApp,
            "<!--SPLIT-->",
            footerApp
        );
        fs.writeFileSync("./html/app/alerts.html", fullHTMLApp, "utf-8");
        infoAlert = 0;
    }
}

/**
 * Automatically removes outdates alerts
 */
function removeAlert() {
    // Set reset time in seconds
    var resetTime = 3600 * 24 * 7;

    // Get existing HTML
    var [header, alerts, footer] = fs
        .readFileSync("./html/alerts.html", "utf-8")
        .split("<!--SPLIT-->");

    var HTML = "";
    var toDelete = 0;

    var contentAlerts = alerts.split("<div");
    for (i = 0; i < contentAlerts.length; i++) {
        if (contentAlerts[i].length > 200) {
            var part = contentAlerts[i].split("a>")[1];
            var [date, rest] = part.split(" |");
            var hour = rest.split("</")[0];

            var fullDate = date.concat(hour);
            var oldTimeStamp = parseInt(Date.parse(fullDate));
            var currentTime = new Date().getTime();

            if (currentTime - oldTimeStamp > resetTime * 1000) {
                contentAlerts[i] = "";
                toDelete = 1;
            }
            if (contentAlerts[i] === "") {
                HTML = HTML.concat(contentAlerts[i]);
            } else {
                HTML = HTML.concat("\n\t\t\t\t<div", contentAlerts[i]);
            }
        }
    }

    if (toDelete === 1) {
        // Merge html
        var fullHTML = header.concat(
            "<!--SPLIT-->",
            HTML,
            "\n\t\t\t\t<!--SPLIT-->",
            footer
        );

        // Write html
        fs.writeFileSync("./html/alerts.html", fullHTML, "utf-8");

        var [headerApp, alerts, footerApp] = fs
            .readFileSync("./html/app/alerts.html", "utf-8")
            .split("<!--SPLIT-->");

        var [part1, part2] = HTML.split('src="');
        var [before, after] = part2.split("width: 35px");
        var HTMLApp = part1.concat('src="../', before, "width: 25px", after);

        var fullHTMLApp = headerApp.concat(
            "<!--SPLIT-->",
            HTMLApp,
            "\n\t\t<!--SPLIT-->",
            footerApp
        );
        fs.writeFileSync("./html/app/alerts.html", fullHTMLApp, "utf-8");
    }
}

/**
 * Writes an alert and saves it on the alerts.html
 * @param {Number} status 0:Warning, 1:Error, 2:Info or 3:Success
 * @param {String} message message to be shown in the alert
 * @param {String} tStamp date of the event in time stamp
 */
function writeAlert(status, message, tStamp) {
    tStamp = parseInt(tStamp);
    // Get existing HTML
    var [header, alerts, footer] = fs
        .readFileSync("./html/alerts.html", "utf-8")
        .toString()
        .split("<!--SPLIT-->");

    // Format time stamp from csv
    var [Month, Day, Year, Hour] = new Date(tStamp)
        .toString()
        .split(" ")
        .slice(1, 5);
    var date = `${Day} ${Month} ${Year} | ${Hour}`;

    // Set message status
    switch (status) {
        case 0:
            var id = "warning";
            var title = "Warning Status";
            break;
        case 1:
            var id = "error";
            var title = "Error Status";
            break;
        case 2:
            var id = "info";
            var title = "Info Status";
            break;
        case 3:
            var id = "success";
            var title = "Success Status";
            break;
    }

    // Create html content to add
    var HTML = `<div class="alerts" id="${id}">
                    <img src="../img/${id}.png" style="width: 35px;" />
                    <a>${date}</a>
                    <h3>${title}</h3>
                    <p>
                        ${message}
                    </p>
                </div>`;

    // Merge html
    var fullHTML = header.concat(
        "<!--SPLIT-->",
        alerts,
        HTML,
        "\n\t\t\t\t<!--SPLIT-->",
        footer
    );

    // Write html
    fs.writeFileSync("./html/alerts.html", fullHTML, "utf-8");

    var [headerApp, alertsApp, footerApp] = fs
        .readFileSync("./html/app/alerts.html", "utf-8")
        .split("<!--SPLIT-->");

    var [part1, part2] = HTML.split('src="');
    var [before, after] = part2.split("width: 35px");
    var HTMLApp = part1.concat('src="../', before, "width: 25px", after);

    var fullHTMLApp = headerApp.concat(
        "<!--SPLIT-->",
        alertsApp,
        HTMLApp,
        "\n\t\t<!--SPLIT-->",
        footerApp
    );
    fs.writeFileSync("./html/app/alerts.html", fullHTMLApp, "utf-8");
}

exports.alertHandler = function (tStamp, T, P, H, NH3, NO2, CO) {
    // Check for hardware error
    checkError(0, tStamp);
    checkSuccess(tStamp);
    checkInfo(tStamp);

    // Check for data warnings
    checkWarning(
        0,
        T,
        [16, 30],
        ["Temperature below 16\u2103.", "Temperature above 30\u2103"],
        tStamp
    );
    checkWarning(
        1,
        P,
        [990, 1060],
        ["Pressure is below 990hPa.", "Pressure is above 1060hPa"],
        tStamp
    );
    checkWarning(
        2,
        H,
        [30, 55],
        [
            "Low humidity, may cause dry skin.",
            "High humidity, may cause mould.",
        ],
        tStamp
    );
    checkWarning(3, NH3, [-1, 1], ["", "High Ammonia[NH3] detected."], tStamp);
    checkWarning(
        4,
        NO2,
        [-1, 1],
        ["", "High Nitrogen Dioxide[NO2], may cause respiratory discomfort."],
        tStamp
    );
    checkWarning(
        5,
        CO,
        [-1, 10],
        ["", "High Carbon Monoxide[CO] detected, evacaute."],
        tStamp
    );

    // Remove outdated alerts
    removeAlert();
};

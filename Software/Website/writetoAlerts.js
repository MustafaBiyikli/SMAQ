const fs = require("fs");
const Email = require("./email");

var alertedHigh = [0, 0, 0, 0, 0, 0];
var alertedLow = [0, 0, 0, 0, 0, 0];
var alertedHighTime = [0, 0, 0, 0, 0, 0];
var alertedLowTime = [0, 0, 0, 0, 0, 0];

var errorAlert = [0];
var errorAlertTime = [0, 0];

var refreshTime = 3600;
var email = "user@email.com";

sendWarningEmail = async (req, res, next) => {
    try {
        await new Email(email).send("email", "Warning from SMAQ");
        console.log("Email send successfully");
    } catch (err) {
        console.log(err.message);
    }
};

/**
 * @param {Number} id id of parameter, assign from 0 in ascending order (different id for each parameter)
 * @param {Number} parameter parameter to check from api
 * @param {Number} value value of parameter as an array [low, high]
 * @param {String} message message to display array [low message, high message]
 * @param {String} tStamp timeStamp from api
 */
function checkWarning(id, parameter, value, message, tStamp) {
    parameter = parseFloat(parameter);
    if (parameter > value[1]) {
        if (alertedHigh[id] === 0) {
            writeAlert(0, message[1], tStamp);
            sendWarningEmail();
            alertedHigh[id] = 1;
            alertedHighTime[id] = new Date().getTime();
        }
    } else if (parameter < value[0]) {
        if (alertedLow[id] === 0) {
            writeAlert(0, message[0], tStamp);
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

function checkSuccess(tStamp) {
    // Check if there was a hardware error and connection is back
    tStamp = parseInt(tStamp);
    var currentTime = new Date().getTime();
    if (errorAlert[0] === 1 && currentTime - tStamp < 2000) {
        writeAlert(3, "Connection established!", tStamp);
        errorAlert[0] = 0;
    }
}

/**
 * @param {Number} id id of the alert
 * @param {String} tStamp time stamp from api
 */
function checkError(id, tStamp) {
    tStamp = parseInt(tStamp);
    // Hardware error
    var currentTime = new Date().getTime();
    if (currentTime - tStamp > 2000 && errorAlert === 0) {
        writeAlert(1, "Hardware error, try restarting SMAQ", currentTime);
        errorAlert[id] = 1;
        errorAlertTime[id] = currentTime;
    }

    // Allow same alert afer 1 hour
    if (new Date().getTime() - errorAlertTime[id] > refreshTime * 1000)
        errorAlert[id] = 0;
}

function checkUserUpdate() {
    // Cannot update user profile
    // Check if settings were updated successfully
}

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
        if (contentAlerts[i].length > 17) {
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
        } else if (alerts.length === 14) {
            writeAlert(
                2,
                "You are fine. There are no warnings to be concerned about.",
                new Date().getTime()
            );
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
    }
}

/**
 * @param {Number} status 0:Warning, 1:Error, 2:Info or 3:Success
 * @param {String} message Warning message
 * @param {String} tStamp Date of the event in time stamp
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
}

exports.alertHandler = function (tStamp, T, P, H, NH3, NO2, CO) {
    // Check for hardware error
    checkError(0, tStamp);
    checkSuccess(tStamp);

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
        0,
        ["Pressure is below 990hPa.", "Pressure is above 1060hPa"],
        tStamp
    );
    checkWarning(
        2,
        H,
        [40, 50],
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
        [-1, 0.1],
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

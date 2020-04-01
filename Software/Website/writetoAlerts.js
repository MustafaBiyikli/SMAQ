const fs = require("fs");

var alertedHigh = [0, 0, 0, 0, 0, 0];
var alertedLow = [0, 0, 0, 0, 0, 0];
var alertedHighTime = [0, 0, 0, 0, 0, 0];
var alertedLowTime = [0, 0, 0, 0, 0, 0];

var errorAlert = 0;

/**
 * @param {number} id id of parameter, assign from 0 in ascending order (different id for each parameter)
 * @param {number} parameter parameter to check from api
 * @param {number} value value of parameter as an array [low, high]
 * @param {String} message message to display array [low message, high message]
 * @param {number} tStamp timeStamp from api
 */
function checkWarning(id, parameter, value, message, tStamp) {
    parameter = parseFloat(parameter);
    if (parameter > value[1]) {
        if (alertedHigh[id] === 0) {
            writeAlert(0, message[1], tStamp);
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
    // allow same alerts after 1 hour
    if (new Date().getTime() - alertedHighTime[id] > 3600 * 1000)
        alertedHigh[id] = 0;
    if (new Date().getTime() - alertedLowTime[id] > 3600 * 1000)
        alertedLow[id] = 0;
}

function checkError(tStamp) {
    tStamp = parseInt(tStamp);
    // Can not update user profile
    var currentTime = new Date().getTime();
    if (currentTime - tStamp > 2000 && errorAlert === 0) {
        writeAlert(1, "Hardware error, try restarting SMAQ", currentTime);
        errorAlert = 1;
    }
}

/**
 * @param {number} status 0:Warning, 1:Error, 2:Info or 3:Success
 * @param {string} message Warning message
 * @param {timeStamp} tStamp Date of the event in time stamp
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

    // merge html
    var fullHTML = header.concat(
        "<!--SPLIT-->",
        alerts,
        HTML,
        "\n\t\t\t<!--SPLIT-->",
        footer
    );

    // Write html
    fs.writeFileSync("./html/alerts.html", fullHTML, "utf-8");
}

exports.alertHandler = function(tStamp, T, P, H, NH3, NO2, CO) {
    checkError(tStamp);

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
            "High humidity, may cause mould."
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
};

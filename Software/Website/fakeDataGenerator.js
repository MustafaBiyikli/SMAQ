const fs = require("fs");
const writetoCSV = require("./writetoCSV");
const writetoAlerts = require("./writetoAlerts");

// 1 minute worth of data
const maxCSVLength = 60;
var counter = 0;

var csvFiles = [
    "./csv/ambient.csv",
    "./csv/api.csv",
    "./csv/gas.csv",
    "./csv/hum.csv",
    "./csv/mic.csv",
    "./csv/press.csv",
    "./csv/temp.csv"
];

// !!! This code will clear your previous data
for (var i = 0; i < csvFiles.length; i++) {
    fs.writeFileSync(csvFiles[i], "", "utf-8");
}

setInterval(function() {
    var tStamp = new Date().getTime();
    var temp = Math.random() * 2 + 24;
    var press = Math.random() * 2 + 1039;
    var humid = Math.random() * 2 + 39;
    var ambient = Math.random() * 2 + 249;
    var prox = Math.random() * 0.1 + 180;
    var alt = Math.random() * 0.1 + 50;
    var mic = Math.random() * 10 + 35;
    var gas = [
        Math.random() * 0.1,
        Math.random() * 0.1 + 0.5,
        Math.random() * 0.1 + 0.6
    ];
    var api = `${tStamp},${ambient},${prox},${temp},${press},${humid},${alt},${mic},${gas[0]},${gas[1]},${gas[2]}`;

    // Append data to CSV as received
    writetoCSV.writeFormatData(
        "./csv/ambient.csv",
        ambient,
        maxCSVLength,
        counter
    );
    writetoCSV.writeFormatData(
        "./csv/gas.csv",
        `${gas[0]},${gas[1]},${gas[2]}`,
        maxCSVLength,
        counter
    );
    writetoCSV.writeFormatData("./csv/hum.csv", humid, maxCSVLength, counter);
    writetoCSV.writeFormatData("./csv/mic.csv", mic, maxCSVLength, counter);
    writetoCSV.writeFormatData("./csv/press.csv", press, maxCSVLength, counter);
    writetoCSV.writeFormatData("./csv/temp.csv", temp, maxCSVLength, counter);
    fs.writeFile("./csv/api.csv", api, err => {
        if (err) throw err.message;
    });

    // Check for alerts
    writetoAlerts.alertHandler(
        tStamp,
        temp,
        press,
        humid,
        gas[0],
        gas[1],
        gas[2]
    );

    if (counter < maxCSVLength + 1) counter++;
}, 1000);

const fs = require("fs");
const dgram = require("dgram");
const writetoCSV = require("./writetoCSV");
const ab2str = require("arraybuffer-to-string");
const writetoAlert = require("./writetoAlerts");

var server = dgram.createSocket("udp4");

const port = 65000;
var count = 0;
const sampleRate = 2; // Hz;
const maxCSVLength = 3600 * 24 * 7 * sampleRate; // 1 week worth of data

server.on("error", (err) => {
    console.log(`server error:\n${err.message}\n${err.stack}`);
});

server.on("listening", function () {
    console.log("Listening on port " + port);
    var address = server.address();
});

var counter = writetoCSV.updateCSV(
    [
        "./csv/ambient.csv",
        "./csv/gas.csv",
        "./csv/hum.csv",
        "./csv/mic.csv",
        "./csv/press.csv",
        "./csv/temp.csv",
    ],
    maxCSVLength,
    count
);

server.on("message", function (message, remote) {
    var smaqData = ab2str(message);
    let [tStamp, ALS, PR, T, P, H, A, MIC, NH3, NO2, CO] = smaqData.split(",");

    // Append data to CSV as received
    writetoCSV.writeFormatData("./csv/ambient.csv", ALS, maxCSVLength, counter);
    writetoCSV.writeFormatData(
        "./csv/gas.csv",
        `${NH3},${NO2},${CO}`,
        maxCSVLength,
        counter
    );
    writetoCSV.writeFormatData("./csv/hum.csv", H, maxCSVLength, counter);
    writetoCSV.writeFormatData("./csv/mic.csv", MIC, maxCSVLength, counter);
    writetoCSV.writeFormatData("./csv/press.csv", P, maxCSVLength, counter);
    writetoCSV.writeFormatData("./csv/temp.csv", T, maxCSVLength, counter);
    fs.writeFile("./csv/api.csv", smaqData, (err) => {
        if (err) throw err.message;
    });

    // Check for alerts
    writetoAlert.alertHandler(tStamp, T, P, H, NH3, NO2, CO);

    if (counter < maxCSVLength + 1) counter++;
});

server.bind({
    host: "localhost",
    port: port,
});

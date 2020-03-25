const fs = require("fs");
const dgram = require("dgram");
const ab2str = require("arraybuffer-to-string");

var server = dgram.createSocket("udp4");

const port = 65000;

server.on("error", err => {
    console.log(`server error:\n${err.message}\n${err.stack}`);
});

server.on("listening", function() {
    console.log("Listening on port " + port);
    var address = server.address();
});

server.on("message", function(message, remote) {
    var smaqData = ab2str(message);
    let [tStamp, ALS, PR, T, P, H, A, MIC, NH3, NO2, CO] = smaqData.split(",");

    fs.appendFile(
        "./csv/ambient.csv",
        `${"\n" + new Date() + "," + ALS}`,
        "utf-8",
        err => {
            if (err) throw err.message;
        }
    );

    fs.appendFile(
        "./csv/press.csv",
        `${"\n" + new Date() + "," + P}`,
        "utf-8",
        err => {
            if (err) throw err.message;
        }
    );

    fs.appendFile(
        "./csv/mic.csv",
        `${"\n" + new Date() + "," + MIC}`,
        "utf-8",
        err => {
            if (err) throw err.message;
        }
    );

    fs.appendFile(
        "./csv/gas.csv",
        `${"\n" + new Date() + "," + NH3 + "," + NO2 + "," + CO}`,
        "utf-8",
        err => {
            if (err) throw err.message;
        }
    );

    fs.appendFile(
        "./csv/temp.csv",
        `${"\n" + new Date() + "," + T}`,
        "utf-8",
        err => {
            if (err) throw err.message;
        }
    );

    fs.appendFile(
        "./csv/hum.csv",
        `${"\n" + new Date() + "," + H}`,
        "utf-8",
        err => {
            if (err) throw err.message;
        }
    );
});

server.bind({
    host: "localhost",
    port: 65000
});

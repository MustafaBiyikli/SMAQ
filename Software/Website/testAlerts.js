const writetoAlerts = require("./writetoAlerts");
const fs = require("fs");

setInterval(function() {
    var [tStamp, ALS, PR, T, P, H, A, MIC, NH3, NO2, CO] = fs
        .readFileSync("./csv/api.csv", "utf-8")
        .split(",");
    writetoAlerts.alertHandler(tStamp, T, P, H, NH3, NO2, CO);
}, 1000);

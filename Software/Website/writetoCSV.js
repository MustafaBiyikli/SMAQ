const fs = require("fs");

/**
 * Cleans or shifts the data in case of any delay
 * @param {String} url Array of addresses to csv files
 * @param {Number} maxLength maximum allowed csv length
 * @param {Number} counter 0, used to return the current length of the csv
 */
exports.updateCSV = (url, maxLength, counter) => {
    var HTML = "";
    for (var i = 0; i < url.length; i++) {
        var data = fs.readFileSync(url[i], "utf-8");
        counter = 0;
        if (data.length != 0) {
            var rows = data.split("\n");
            var lastTimeStamp = rows[rows.length - 2].split(",")[0];
            var delay = new Date().getTime() - lastTimeStamp;
            if (delay > (maxLength / 2) * 1000 || rows.length < 100) {
                fs.writeFile(url[i], "", (err) => {
                    if (err) throw err.message;
                });
                if (i === 0) {
                    var data = fs.readFileSync("./html/alerts.html", "utf-8");
                    var [header, alerts, footer] = data.split("<!--SPLIT-->");
                    HTML = HTML.concat(
                        header,
                        "<!--SPLIT-->",
                        "\n\t\t\t\t<!--SPLIT-->",
                        footer
                    );
                    fs.writeFile("./html/alerts.html", HTML, (err) => {
                        if (err) throw err.message;
                    });
                }
                counter = 0;
            } else {
                counter += rows.length - 2 + Math.round(delay / 1000) * 2;
                if (counter > maxLength + 1) {
                    // delete samples at the beginning as many as delay is worth
                    var shift = counter - maxLength + 1;
                    var newData = rows.slice(shift, maxLength + 1).join("\n");
                    fs.writeFileSync(url[i], newData, "utf-8");
                }
            }
        }
    }
    return counter;
};

/**
 * Writes the data into the csv file with a current time stamp, and shifts the data to always have maximum length
 * @param {String} url address to the csv file
 * @param {String} data data to be written to the csv (only the parameter, no need for time)
 * @param {Number} maxLength maximum allowed csv length
 * @param {Number} counter the current length of the csv
 */
exports.writeFormatData = (url, data, maxLength, counter) => {
    fs.appendFile(url, `${new Date().getTime()},${data}\n`, (err) => {
        if (err) throw err;
    });

    if (counter >= maxLength) {
        var csvRead = fs.readFileSync(url, "utf-8");
        var oldestTime = csvRead.split("\n")[0].split(",")[0];
        var maxLenTime = (maxLength / 2) * 1000;
        var totalTime = new Date().getTime() - oldestTime;
        if (totalTime >= maxLenTime) {
            var csvMod = csvRead
                .split("\n")
                .slice(1, maxLength + 1)
                .join("\n");
            fs.writeFileSync(url, csvMod, "utf-8");
        }
    }
};

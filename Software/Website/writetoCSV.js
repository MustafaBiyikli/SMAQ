const fs = require("fs");

// TODO: improve, as it is, if udp_receive stopped, previous data in buffer will be lost
//       instead, shift data within the timeframe (if within timeframe)

exports.updateCSV = (url, maxLength, counter) => {
    for (var i = 0; i < url.length; i++) {
        var data = fs.readFileSync(url[i], "utf-8");
        if (data.length != 0) {
            var rows = data.split("\n");
            var lastTimeStamp = rows[rows.length - 2].split(",")[0];
            var delay = new Date().getTime() - lastTimeStamp;
            if (delay > (maxLength / 2) * 1000) {
                fs.writeFileSync(url[i], "", "utf-8");
            } else {
                counter += rows.length - 2 + (delay / 1000) * 2;
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

exports.writeFormatData = (url, data, maxLength, counter) => {
    fs.appendFile(url, `${new Date().getTime()},${data}\n`, err => {
        if (err) throw err;
    });

    if (counter >= maxLength + 1) {
        var csvRead = fs
            .readFileSync(url, "utf-8")
            .split("\n")
            .slice(1, maxLength + 1)
            .join("\n");
        fs.writeFileSync(url, csvRead, "utf-8");
    }
};

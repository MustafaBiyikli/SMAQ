const fs = require("fs");

// TODO: improve, as it is, if udp_receive stopped, previous data in buffer will be lost
//       instead, shift data within the timeframe (if within timeframe)

exports.clearCSV = url => {
    for (var i = 0; url.length; i++) {
        if (fs.readFileSync(url[i], "utf-8").length != 0)
            fs.writeFileSync(url[i], "", "utf-8");
    }
};

exports.writeFormatData = (url, data, maxLength, counter) => {
    fs.appendFile(url, `${data}\n`, err => {
        if (err) throw err;
    });

    if (counter >= maxLength + 1) {
        counter = maxLength + 1; // shouldn't keep growing
        var csvRead = fs
            .readFileSync(url, "utf-8")
            .split("\n")
            .slice(1, maxLength + 1)
            .join("\n");
        fs.writeFileSync(url, csvRead, "utf-8");
    }
};

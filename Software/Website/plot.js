$(document).ready(function () {
    var data1 = "./csv/temp.csv";
    var data2 = "./csv/hum.csv";
    var data3 = "./csv/ambient.csv";
    var data4 = "./csv/press.csv";
    var data5 = "./csv/mic.csv";
    var data6 = "./csv/gas.csv";
    var timeWindow = 3600 * 24; // default timeline to view (1 day)
    var checkBox = document.getElementById("auto-zoom");
    var btnContainer = document.getElementsByClassName("button-container")[0];
    var btns = btnContainer.getElementsByClassName("btn");

    function formatButton(index = null) {
        var current = document.getElementsByClassName("active");
        if (current.length > 0)
            current[0].className = current[0].className.replace("active", "");
        if (index != null) btns[index].className += " active";
    }

    /**
     * @param graphID graphID of master plot
     * @param {string} divIDplot div_id of plot from HTML
     * @param {string} CSVdata path to CSV data
     * @param {string} labelY i.e: "Temperature [\u2103]"
     * @param {String} seriesName series names for the legend i.e: ["Time", "param1", "param2" ..]
     */
    function addPlot(
        graphID,
        divIDplot,
        CSVdata,
        labelY,
        seriesName = ["Time", labelY]
    ) {
        graphID = new Dygraph(document.getElementById(divIDplot), CSVdata, {
            axes: {
                x: {
                    valueFormatter: function (ms) {
                        var currentTime = new Date(ms)
                            .toString()
                            .split(" ")
                            .slice(0, 5)
                            .join(" ");
                        return `${currentTime} `;
                    },
                    axisLabelFormatter: function (ms) {
                        var currentTime = `${
                            new Date(ms).toString().split(" ")[4]
                        }`;
                        return currentTime;
                    },
                },
            },
            animatedZooms: true,
            labels: seriesName,
            legend: "follow",
            xlabel: "Time [UTC]",
            ylabel: labelY,
            fillGraph: true,
        });

        window.intervalId = setInterval(function () {
            graphID.updateOptions({ file: CSVdata });
            if (checkBox.checked === true) {
                switch (timeWindow) {
                    case 3600:
                        formatButton(6);
                        break;
                    case 3600 * 6:
                        formatButton(5);
                        break;
                    case 3600 * 12:
                        formatButton(4);
                        break;
                    case 3600 * 24:
                        formatButton(3);
                        break;
                    case 3600 * 24 * 3:
                        formatButton(2);
                        break;
                    case 3600 * 24 * 5:
                        formatButton(1);
                        break;
                    case 3600 * 24 * 7:
                        formatButton(0);
                        break;
                }
                graphID.updateOptions({
                    dateWindow: [
                        new Date().getTime() - timeWindow * 1000,
                        new Date().getTime(),
                    ],
                });
            } else {
                formatButton();
            }
        }, 1000);
    }

    document.getElementById("1hour").onclick = function () {
        if (checkBox.checked === true) timeWindow = 3600;
    };

    document.getElementById("6hours").onclick = function () {
        if (checkBox.checked === true) timeWindow = 3600 * 6;
    };

    document.getElementById("12hours").onclick = function () {
        if (checkBox.checked === true) timeWindow = 3600 * 12;
    };

    document.getElementById("24hours").onclick = function () {
        if (checkBox.checked === true) timeWindow = 3600 * 24;
    };

    document.getElementById("3days").onclick = function () {
        if (checkBox.checked === true) timeWindow = 3600 * 24 * 3;
    };

    document.getElementById("5days").onclick = function () {
        if (checkBox.checked === true) timeWindow = 3600 * 24 * 5;
    };

    document.getElementById("1week").onclick = function () {
        if (checkBox.checked === true) timeWindow = 3600 * 24 * 7;
    };

    var g1, g2, g3, g4, g5, g6;
    if (document.getElementById("div1_g"))
        addPlot(g1, "div1_g", data1, "Temperature [\u2103]");

    if (document.getElementById("div2_g"))
        addPlot(g2, "div2_g", data2, "Humidity [%]");

    if (document.getElementById("div3_g"))
        addPlot(g3, "div3_g", data3, "Ambient Light [lux]");

    if (document.getElementById("div4_g"))
        addPlot(g4, "div4_g", data4, "Pressure [hPa]");

    if (document.getElementById("div5_g"))
        addPlot(g5, "div5_g", data5, "Sound Level [%]");

    if (document.getElementById("div6_g"))
        addPlot(g6, "div6_g", data6, "Gasses [ppm]", [
            "Time",
            "NH3",
            "NO2",
            "CO",
        ]);
});

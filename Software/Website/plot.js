$(document).ready(function() {
    var data1 = "./csv/temp.csv";
    var data2 = "./csv/hum.csv";
    var data3 = "./csv/ambient.csv";
    var data4 = "./csv/press.csv";
    var data5 = "./csv/mic.csv";
    var data6 = "./csv/gas.csv";

    /**
     * @param graphID graphID of master plot
     * @param {string} divIDplot div_id of plot from HTML
     * @param {string} CSVdata path to CSV data
     * @param {number} rangeMinMax min max values to display on plot i.e: [0, 40]
     * @param {string} labelY i.e: "Temperature [\u2103]"
     */

    function addPlot(divIDplot, CSVdata, rangeMinMax, labelY) {
        var g = new Dygraph(document.getElementById(divIDplot), CSVdata, {
            axes: {
                x: {
                    valueFormatter: function(ms) {
                        var currentTime = new Date(ms)
                            .toString()
                            .split(" ")
                            .slice(0, 5)
                            .join(" ");
                        return `${currentTime} `;
                    },
                    axisLabelFormatter: function(ms) {
                        var currentTime = `${
                            new Date(ms).toString().split(" ")[4]
                        }`;
                        return currentTime;
                    }
                }
            },
            showRangeSelector: true,
            valueRange: rangeMinMax,
            labels: ["Time [UTC]", labelY]
        });
        window.intervalId = setInterval(function() {
            g.updateOptions({ file: CSVdata });
        }, 1000);
    }

    addPlot("div1_g", data1, [0, 40], "Temperature [\u2103]");
    addPlot("div2_g", data2, [0, 100], "Humidity [%]");
    addPlot("div3_g", data3, [0, 1000], "Ambient Light [lux]");
    addPlot("div4_g", data4, [900, 1100], "Pressure [hPa]");
    addPlot("div5_g", data5, [0, 100], "Sound Level [%]");
    addPlot("div6_g", data6, [0, 10], "Gasses [ppm]");
});

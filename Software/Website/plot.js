$(document).ready(function() {
    var data1 = "./csv/temp.csv";
    var data2 = "./csv/hum.csv";
    var data3 = "./csv/ambient.csv";
    var data4 = "./csv/press.csv";
    var data5 = "./csv/mic.csv";
    var data6 = "./csv/gas.csv";

    /**
     * @param {*} graphID Dygraph object. var g1;
     * @param {string} divID #div from HTML
     * @param {string} CSVdata path to CSV file
     * @param {number} valueMinMax [min, max]
     * @param {string} labelsXY ["label X", "label Y", "label Y2", "label Yn"]
     */
    function addPlot(graphID, divID, CSVdata, valueMinMax, labelsXY) {
        graphID = new Dygraph(document.getElementById(divID), CSVdata, {
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
            valueRange: valueMinMax,
            labels: labelsXY
        });
        window.intervalId = setInterval(function() {
            graphID.updateOptions({ file: CSVdata });
        }, 1000);
    }

    /**
     * @param graphID graphID of master plot
     * @param {string} divID div_id from HTML
     * @param {string} seriesName name and title of gauge
     * @param {string} type type of gauge "see Highcharts wepage"
     * @param {number} angleStartEnd number array i.e: [-90, 90]
     * @param {string} backgroundColor hex color i.e: #FFF
     * @param {string} radiusInOut percentage inner outer ["60%", "100%"]
     * @param {string} colorRange string buffer of 3 colors for min max i.e: ["#1601D4", "#FFD000", "#DF5353"]
     * @param {number} rangeMinMax min max values to display on gauge i.e: [0, 40]
     * @param {string} valueUnit unit to display i.e: "\u2103" for degrees celcius
     */
    function addGauge(
        graphID,
        divID,
        seriesName,
        type,
        angleStartEnd,
        backgroundColor,
        radiusInOut,
        colorRange,
        rangeMinMax,
        valueUnit
    ) {
        var gaugeOptions = {
            chart: {
                type: type,
                height: "350px",
                margin: 20,
                backgroundColor: "#FFF"
            },
            title: "null",
            pane: {
                center: ["50%", "60%"],
                size: "100%",
                startAngle: angleStartEnd[0],
                endAngle: angleStartEnd[1],
                background: {
                    backgroundColor: backgroundColor,
                    innerRadius: radiusInOut[0],
                    outerRadius: radiusInOut[1],
                    shape: "arc"
                }
            },
            exporting: {
                enabled: false
            },
            tooltip: {
                enabled: false
            },
            // the value axis
            yAxis: {
                stops: [
                    [0.3, colorRange[0]], // green
                    [0.6, colorRange[1]], // yellow
                    [0.9, colorRange[2]] // red
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: (rangeMinMax[1] - rangeMinMax[0]) / 10,
                tickAmount: 2,
                labels: {
                    y: 20
                }
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: -60,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            }
        };

        // The speed gauge
        var myGauge = Highcharts.chart(
            divID,
            Highcharts.merge(gaugeOptions, {
                yAxis: {
                    min: rangeMinMax[0],
                    max: rangeMinMax[1]
                },
                credits: {
                    enabled: false
                },
                series: [
                    {
                        name: seriesName,
                        data: [rangeMinMax[1] / 2],
                        radius: radiusInOut[1],
                        innerRadius: radiusInOut[0],
                        dataLabels: {
                            format:
                                `<div style="text-align:center">` +
                                `<span style="font-size:25px">{y}</span><br/>` +
                                `<span style="font-size:20px;opacity:0.4">${valueUnit}</span>` +
                                `</div>`
                        },
                        tooltip: {
                            valueSuffix: ` ${valueUnit}`
                        }
                    }
                ]
            })
        );

        // Bring life to the dials
        setInterval(function() {
            // Speed
            var point;
            if (myGauge) {
                point = myGauge.series[0].points[0];
                point.update(
                    Math.round(
                        graphID.getValue(graphID.numRows() - 1, 1) * 100
                    ) / 100
                );
            }
        }, 1000);
    }

    // Add Plots
    var g1;
    addPlot(
        g1,
        "div1_g",
        data1,
        [0, 40],
        ["Time [UTC]", "Temperature [\u2103]"]
    );

    var g2;
    addPlot(g2, "div2_g", data2, [20, 60], ["Time [UTC]", "Humidity [%]"]);

    var g3;
    addPlot(
        g3,
        "div3_g",
        data3,
        [0, 1000],
        ["Time [UTC]", "Ambient Light [lux]"]
    );

    var g4;
    addPlot(g4, "div4_g", data4, [850, 1100], ["Time [UTC]", "Pressure [hPa]"]);

    var g5;
    addPlot(
        g5,
        "div5_g",
        data5,
        [0, Math.pow(2, 16)],
        ["Time [UTC]", "Sound Level [dB]"]
    );

    var g6;
    addPlot(
        g6,
        "div6_g",
        data6,
        [0, Math.pow(2, 16)],
        ["Time [UTC]", "NH3", "NO2", "CO"]
    );

    // Add Gauges
    addGauge(
        g1,
        "container-temperature",
        "Temperature",
        "solidgauge",
        [-90, 90],
        "#AAA",
        ["60%", "100%"],
        ["#1601D4", "#FFD000", "#DF5353"],
        [0, 40],
        "\u2103"
    );

    addGauge(
        g4,
        "container-pressure",
        "Pressure",
        "solidgauge",
        [-90, 90],
        "#AAA",
        ["60%", "100%"],
        ["#1601D4", "#FFD000", "#DF5353"],
        [850, 1100],
        "hPa"
    );

    addGauge(
        g2,
        "container-humidity",
        "Humidity",
        "solidgauge",
        [-90, 90],
        "#AAA",
        ["60%", "100%"],
        ["#1601D4", "#FFD000", "#DF5353"],
        [20, 60],
        "%"
    );

    addGauge(
        g3,
        "container-ambient-light",
        "ambientLight",
        "solidgauge",
        [-90, 90],
        "#AAA",
        ["60%", "100%"],
        ["#1601D4", "#FFD000", "#DF5353"],
        [0, 1000],
        "lux"
    );

    addGauge(
        g5,
        "container-sound-levels",
        "soundLevels",
        "solidgauge",
        [-45, 45],
        "#FFF",
        ["90%", "100%"],
        ["#1601D4", "#FFD000", "#DF5353"],
        [0, 100],
        "%"
    );

    var gasGaugeOptions = {
        chart: {
            type: "solidgauge",
            height: "350px",
            margin: 40,
            backgroundColor: "#FFF"
        },
        title: {
            text: "NH3, NO2, CO"
        },
        pane: {
            size: "100%",
            center: ["50%", "50%"],
            startAngle: -150,
            endAngle: 150,
            background: [
                {
                    outerRadius: "100%",
                    innerRadius: "85%",
                    backgroundColor: Highcharts.color(
                        Highcharts.getOptions().colors[0]
                    )
                        .setOpacity(0.5)
                        .get(),
                    borderWidth: 1,
                    shape: "arc"
                },
                {
                    outerRadius: "84%",
                    innerRadius: "70%",
                    backgroundColor: Highcharts.color(
                        Highcharts.getOptions().colors[1]
                    )
                        .setOpacity(0.5)
                        .get(),
                    borderWidth: 1,
                    shape: "arc"
                },
                {
                    outerRadius: "69%",
                    innerRadius: "55%",
                    backgroundColor: Highcharts.color(
                        Highcharts.getOptions().colors[2]
                    )
                        .setOpacity(0.5)
                        .get(),
                    borderWidth: 1,
                    shape: "arc"
                }
            ]
        },
        exporting: {
            enabled: false
        },
        tooltip: {
            borderWidth: 0,
            backgroundColor: "none",
            shadow: false,
            style: {
                fontSize: "16px"
            },
            valueSuffix: "%",
            pointFormat:
                '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}</span>',
            positioner: function(labelWidth) {
                return {
                    x: (this.chart.chartWidth - labelWidth) / 2,
                    y: this.chart.plotHeight / 2
                };
            }
        },
        yAxis: {
            stops: [
                [0.3, "#1601D4"], // green
                [0.6, "#FFD000"], // yellow
                [0.9, "#DF5353"] // red
            ],
            lineWidth: 0,
            tickWidth: 0,
            minorTickInterval: 0,
            tickAmount: 2,
            labels: {
                y: 20
            }
        },
        plotOptions: {
            solidgauge: {
                dataLabels: {
                    enabled: false
                },
                rounded: true
            }
        }
    };

    var myGasGauge = Highcharts.chart(
        "container-air-quality",
        Highcharts.merge(gasGaugeOptions, {
            yAxis: {
                min: 0,
                max: 100
            },
            credits: {
                enabled: false
            },
            series: [
                {
                    name: "NH3",
                    data: [
                        {
                            color: Highcharts.getOptions().colors[0],
                            radius: "100%",
                            innerRadius: "85%",
                            y: 50
                        }
                    ]
                },
                {
                    name: "NO2",
                    data: [
                        {
                            color: Highcharts.getOptions().colors[1],
                            radius: "84%",
                            innerRadius: "70%",
                            y: 1
                        }
                    ]
                },
                {
                    name: "CO",
                    data: [
                        {
                            color: Highcharts.getOptions().colors[2],
                            radius: "69%",
                            innerRadius: "55%",
                            y: 2
                        }
                    ]
                }
            ]
        })
    );
    setInterval(function() {
        // Speed
        var pointNH3;
        var pointNO2;
        var pointCO;
        if (myGasGauge) {
            pointNH3 = myGasGauge.series[0].points[0];
            pointNH3.update(
                Math.round(g6.getValue(g6.numRows() - 1, 1) * 100) / 100
            );

            pointNO2 = myGasGauge.series[1].points[0];
            pointNO2.update(
                Math.round(g6.getValue(g6.numRows() - 1, 2) * 100) / 100
            );

            pointCO = myGasGauge.series[2].points[0];
            pointCO.update(
                Math.round(g6.getValue(g6.numRows() - 1, 3) * 100) / 100
            );
        }
    }, 1000);
});

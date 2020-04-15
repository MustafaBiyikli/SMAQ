$(document).ready(function () {
    var api = "./csv/api.csv";

    /**
     * Creates a custom Highcharts gauge
     * @param {String} divIDGauge div_id of gauge from HTML
     * @param {Number} rangeMinMax min max values to display on gauge i.e: [0, 40]
     * @param {String} seriesName name and title of gauge
     * @param {Number} angleStartEnd number array i.e: [-90, 90]
     * @param {String} valueUnit unit to display i.e: "\u2103" for degrees celcius
     * @param {Number} apiIndex value index from api.csv
     * @param {Number} rounding number of decimal places
     * @param {String} formatHTML HTML string used for formatting the labels
     * @param {Number} marginHeight
     * @param {Number} yHeight
     * @param {String} radiusInOut percentage inner outer ["60%", "100%"]
     * @param {String} backgroundColor hex color i.e: "#FFF"
     * @param {String} colorRange string buffer of 3 colors for min max i.e: ["#1601D4", "#FFD000", "#DF5353"]
     */
    function addGauge(
        divIDGauge,
        rangeMinMax,
        seriesName,
        angleStartEnd,
        valueUnit,
        apiIndex,
        rounding,
        formatHTML,
        marginHeight,
        yHeight,
        radiusInOut = ["60%", "100%"],
        backgroundColor = "#FFF",
        colorRange = ["#1601D4", "#FFD000", "#FF0000"]
    ) {
        var gaugeOptions = {
            chart: {
                type: "solidgauge",
                height: "75%",
                margin: marginHeight,
                backgroundColor: "#FFF",
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
                    shape: "arc",
                },
            },
            exporting: {
                enabled: false,
            },
            tooltip: {
                enabled: false,
            },
            yAxis: {
                stops: [
                    [0.3, colorRange[0]], // green
                    [0.6, colorRange[1]], // yellow
                    [0.9, colorRange[2]], // red
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: (rangeMinMax[1] - rangeMinMax[0]) / 10,
                tickAmount: 2,
                labels: {
                    y: 20,
                },
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: yHeight,
                        borderWidth: 0,
                        useHTML: true,
                    },
                },
            },
        };

        var myGauge = Highcharts.chart(
            divIDGauge,
            Highcharts.merge(gaugeOptions, {
                yAxis: {
                    min: rangeMinMax[0],
                    max: rangeMinMax[1],
                },
                credits: {
                    enabled: false,
                },
                series: [
                    {
                        name: seriesName,
                        data: [
                            Math.round((rangeMinMax[1] + rangeMinMax[0]) / 1.4),
                        ],
                        radius: radiusInOut[1],
                        innerRadius: radiusInOut[0],
                        dataLabels: {
                            format:
                                formatHTML + `${valueUnit}</span>` + `</div>`,
                        },
                        tooltip: {
                            valueSuffix: ` ${valueUnit}`,
                        },
                    },
                ],
            })
        );

        setInterval(function () {
            $.ajax({
                type: "GET",
                url: api,
                dataType: "text",
                success: function (dataRead) {
                    var apiData = parseFloat(dataRead.split(",")[apiIndex]);
                    apiData =
                        Math.round(apiData * Math.pow(10, rounding)) /
                        Math.pow(10, rounding);
                    var point = myGauge.series[0].points[0];
                    point.update(apiData);
                },
            });
        }, 1000);
    }

    if (document.getElementById("appGauge")) {
        formatHTML =
            `<div style="text-align:center">` +
            `<span style="font-size:1.4em;opacity:0.6">{y} ` +
            ``;
        marginHeight = 0;
        yHeight = -25;
        yHeightMic = -40;
    } else {
        formatHTML =
            `<div style="text-align:center">` +
            `<span style="font-size:25px">{y}</span><br/>` +
            `<span style="font-size:20px;opacity:0.4">`;
        marginHeight = 20;
        yHeight = -60;
        yHeightMic = -60;
    }

    addGauge(
        "container-temperature",
        [0, 40],
        "Temperature",
        [-90, 90],
        "\u2103",
        3,
        2,
        formatHTML,
        marginHeight,
        yHeight
    );

    addGauge(
        "container-humidity",
        [0, 100],
        "Humidity",
        [-90, 90],
        "%",
        5,
        2,
        formatHTML,
        marginHeight,
        yHeight
    );

    addGauge(
        "container-ambient-light",
        [0, 3000],
        "ambientLight",
        [-90, 90],
        "lux",
        1,
        0,
        formatHTML,
        marginHeight,
        yHeight
    );

    addGauge(
        "container-pressure",
        [900, 1100],
        "Pressure",
        [-90, 90],
        "hPa",
        4,
        0,
        formatHTML,
        marginHeight,
        yHeight
    );

    addGauge(
        "container-sound-level",
        [0, 100],
        "soundLevel",
        [-45, 45],
        "%",
        7,
        0,
        formatHTML,
        marginHeight,
        yHeightMic,
        ["80%", "100%"]
    );

    // Define special gauge for the gasses
    var gasGaugeOptions = {
        chart: {
            type: "solidgauge",
            height: "75%",
            margin: 40,
            backgroundColor: "#FFF",
        },
        title: {
            text: "NH3, NO2, CO",
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
                    shape: "arc",
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
                    shape: "arc",
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
                    shape: "arc",
                },
            ],
        },
        exporting: {
            enabled: false,
        },
        tooltip: {
            borderWidth: 0,
            backgroundColor: "none",
            shadow: false,
            style: {
                fontSize: "16px",
            },
            valueSuffix: "ppm",
            pointFormat:
                '{series.name}<br><span style="font-size:1.5em; color: {point.color}; font-weight: bold">{point.y:.3f}</span>',
            positioner: function (labelWidth) {
                return {
                    x: (this.chart.chartWidth - labelWidth) / 2,
                    y: this.chart.plotHeight / 2,
                };
            },
        },
        yAxis: {
            stops: [
                [0.3, "#1601D4"], // green
                [0.6, "#FFD000"], // yellow
                [0.9, "#DF5353"], // red
            ],
            lineWidth: 0,
            tickWidth: 0,
            minorTickInterval: 0,
            tickAmount: 2,
            labels: {
                y: 20,
            },
        },
        plotOptions: {
            solidgauge: {
                dataLabels: {
                    enabled: false,
                    allowOverlap: false,
                },
                rounded: true,
            },
        },
        series: [
            {
                name: "NH3",
                data: [
                    {
                        color: Highcharts.getOptions().colors[0],
                        radius: "100%",
                        innerRadius: "85%",
                        y: 4,
                    },
                ],
                dataLabels: {
                    y: -30,
                    x: 8,
                    formatter: function () {
                        return (
                            'NH3 <span style="color:#339">' +
                            Highcharts.numberFormat(this.y, 3) +
                            ` ppm</span><br/>`
                        );
                    },
                },
            },
            {
                name: "NO2",
                data: [
                    {
                        color: Highcharts.getOptions().colors[1],
                        radius: "84%",
                        innerRadius: "70%",
                        y: 4,
                    },
                ],
                dataLabels: {
                    y: -15,
                    x: 8,
                    formatter: function () {
                        return (
                            'NO2 <span style="color:#339">' +
                            Highcharts.numberFormat(this.y, 3) +
                            ` ppm</span><br/>`
                        );
                    },
                },
            },
            {
                name: "CO",
                data: [
                    {
                        color: Highcharts.getOptions().colors[2],
                        radius: "69%",
                        innerRadius: "55%",
                        y: 4,
                    },
                ],
                dataLabels: {
                    y: -1,
                    x: 8,
                    formatter: function () {
                        return (
                            `CO <span style="color:#339">` +
                            Highcharts.numberFormat(this.y, 3) +
                            ` ppm</span><br/>`
                        );
                    },
                },
            },
        ],
    };

    if (document.getElementById("appGauge")) {
        gasGaugeOptions.title = null;
        gasGaugeOptions.chart.margin = 10;
        gasGaugeOptions.plotOptions.solidgauge.dataLabels.enabled = true;
        gasGaugeOptions.plotOptions.solidgauge.dataLabels.borderWidth = 0;
        gasGaugeOptions.pane.startAngle = -110;
        gasGaugeOptions.pane.endAngle = 110;
    }

    var myGasGauge = Highcharts.chart(
        "container-air-quality",
        Highcharts.merge(gasGaugeOptions, {
            yAxis: {
                min: 0,
                max: 10,
            },
            credits: {
                enabled: false,
            },
        })
    );
    setInterval(function () {
        $.ajax({
            type: "GET",
            url: api,
            dataType: "text",
            success: function (dataRead) {
                var apiDataNH3 = parseFloat(dataRead.split(",")[8]);
                var apiDataNO2 = parseFloat(dataRead.split(",")[9]);
                var apiDataCO = parseFloat(dataRead.split(",")[10]);
                var pointNH3 = myGasGauge.series[0].points[0];
                pointNH3.update(apiDataNH3);
                var pointNO2 = myGasGauge.series[1].points[0];
                pointNO2.update(apiDataNO2);
                var pointCO = myGasGauge.series[2].points[0];
                pointCO.update(apiDataCO);
            },
        });
    }, 1000);
});

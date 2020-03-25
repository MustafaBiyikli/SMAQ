$(document).ready(function() {
    var data1 = "./csv/temp.csv";
    var data2 = "./csv/hum.csv";
    var data3 = "./csv/ambient.csv";
    var data4 = "./csv/press.csv";
    var data5 = "./csv/mic.csv";
    var data6 = "./csv/gas.csv";

    var g1 = new Dygraph(document.getElementById("div1_g"), data1, {
        drawPoints: false,
        showRoller: true,
        //valueRange: [35, 35],
        labels: ["Time", "Temperature [\u2103]"],
        legend: true
    });
    window.intervalId = setInterval(function() {
        g1.updateOptions({ file: data1 });
    }, 1000);

    var g2 = new Dygraph(document.getElementById("div2_g"), data2, {
        drawPoints: false,
        showRoller: true,
        labels: ["Time", "Humidity [%]"]
    });
    window.intervalId = setInterval(function() {
        g2.updateOptions({ file: data2 });
    }, 1000);

    var g3 = new Dygraph(document.getElementById("div3_g"), data3, {
        drawPoints: false,
        showRoller: true,
        labels: ["Time", "Ambient Light [lux]"]
    });
    window.intervalId = setInterval(function() {
        g3.updateOptions({ file: data3 });
    }, 1000);

    var g4 = new Dygraph(document.getElementById("div4_g"), data4, {
        drawPoints: false,
        showRoller: true,
        labels: ["Time", "Pressure [hPa]"]
    });
    window.intervalId = setInterval(function() {
        g4.updateOptions({ file: data4 });
    }, 1000);

    var g5 = new Dygraph(document.getElementById("div5_g"), data5, {
        drawPoints: false,
        showRoller: true,
        labels: ["Time", "Microphone"]
    });
    window.intervalId = setInterval(function() {
        g5.updateOptions({ file: data5 });
    }, 1000);

    var g6 = new Dygraph(document.getElementById("div6_g"), data6, {
        drawPoints: false,
        showRoller: true,
        labels: ["Time", "Ammonia", "Nitrogen Dioxide", "Carbon Monoxide"]
    });
    window.intervalId = setInterval(function() {
        g6.updateOptions({ file: data6 });
    }, 1000);
});

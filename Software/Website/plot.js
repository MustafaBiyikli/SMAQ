$(document).ready(function() {
     var data1 = "./csv/temp.csv";
     var data2 = "./csv/hum.csv";
     var data3 = "./csv/ambient.csv";
     var data4 = "./csv/press.csv";
     var data5 = "./csv/mic.csv";
     var data6 = "./csv/gas.csv";

     var g1 = new Dygraph(document.getElementById("div1_g"), data1, {
          title: "Temperature [\u2103]",
          //valueRange: [35, 35],
          xlabel: "Time [s]",
          ylabel: "Temperature [\u2103]",
          labels: ["Time", "Temperature [\u2103]"],
          legend: true
     });
     window.intervalId = setInterval(function() {
          g1.updateOptions({ file: data1 });
     }, 1000);

     var g2 = new Dygraph(document.getElementById("div2_g"), data2, {
          title: "Humidity [%]",
          xlabel: "Time [s]",
          ylabel: "Humidity [%]",
          labels: ["Time", "Humidity [%]"]
     });
     window.intervalId = setInterval(function() {
          g2.updateOptions({ file: data2 });
     }, 1000);

     var g3 = new Dygraph(document.getElementById("div3_g"), data3, {
          title: "Ambient Light [lux]",
          xlabel: "Time [s]",
          ylabel: "Ambient Light [lux]",
          labels: ["Time", "Ambient Light [lux]"]
     });
     window.intervalId = setInterval(function() {
          g3.updateOptions({ file: data3 });
     }, 1000);

     var g4 = new Dygraph(document.getElementById("div4_g"), data4, {
          title: "Pressure [hPa]",
          xlabel: "Time [s]",
          ylabel: "Pressure [hPa]",
          labels: ["Time", "Pressure [hPa]"]
     });
     window.intervalId = setInterval(function() {
          g4.updateOptions({ file: data4 });
     }, 1000);

     var g5 = new Dygraph(document.getElementById("div5_g"), data5, {
          title: "Microphone",
          xlabel: "Time [s]",
          ylabel: "Microphone",
          labels: ["Time", "Microphone"]
     });
     window.intervalId = setInterval(function() {
          g5.updateOptions({ file: data5 });
     }, 1000);

     var g6 = new Dygraph(document.getElementById("div6_g"), data6, {
          title: "GASSES [NH3, NO2, CO]",
          xlabel: "Time [s]",
          ylabel: "Gasses [ppm]",
          labels: ["Time", "Ammonia", "Nitrogen Dioxide", "Carbon Monoxide"]
     });
     window.intervalId = setInterval(function() {
          g6.updateOptions({ file: data6 });
     }, 1000);
});

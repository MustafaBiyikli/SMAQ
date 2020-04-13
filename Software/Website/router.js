const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/index.html"));
});

router.get("/dashboard", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/index.html"));
});

router.get("/temperature", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/temp.html"));
});

router.get("/ambient-light", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/ambient.html"));
});

router.get("/pressure", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/press.html"));
});

router.get("/humidity", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/hum.html"));
});

router.get("/sound-level", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/mic.html"));
});

router.get("/air-quality", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/gas.html"));
});

router.get("/alerts", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/alerts.html"));
});

router.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/about.html"));
});

router.get("/contact", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/contact.html"));
});

router.get("/settings", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/settings.html"));
});

router.get("/api", function (req, res) {
    fs.readFile("./csv/api.csv", (err, data) => {
        if (err) throw err.message;
        var [
            timeStamp,
            ALS,
            PR,
            T,
            P,
            H,
            A,
            MIC,
            NH3,
            NO2,
            CO,
        ] = data.toString().split(",");
        res.status(200).json({
            timeStamp,
            ambientLight: ALS,
            proximity: PR,
            temperature: T,
            pressure: P,
            humidity: H,
            altitude: A,
            microphone: MIC,
            gasses: {
                NH3,
                NO2,
                CO,
            },
        });
    });
});

/** Routes for the Android native app */
router.get("/app&dashboard", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/dashboard.html"));
});

router.get("/app/v1/contact", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/contact.html"));
});

router.get("/app/v1/alerts", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/alerts.html"));
});

router.get("/app/v1/about", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/about.html"));
});

router.get("/app/v1/settings", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/settings.html"));
});

router.get("/app&ambient", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/ambient.html"));
});

router.get("/app&gas", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/gas.html"));
});

router.get("/app&hum", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/hum.html"));
});

router.get("/app&mic", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/mic.html"));
});

router.get("/app&press", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/press.html"));
});

router.get("/app&temp", function (req, res) {
    res.sendFile(path.join(__dirname + "/html/app/temp.html"));
});

module.exports = router;

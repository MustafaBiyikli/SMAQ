const express = require("express");
const app = express();

const path = require("path");
const router = express.Router();

router.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/html/index.html"));
});

router.get("/dashboard", function(req, res) {
    res.sendFile(path.join(__dirname + "/html/index.html"));
});

router.get("/temperature", function(req, res) {
    res.sendFile(path.join(__dirname + "/html/temp.html"));
});

router.get("/ambient-light", function(req, res) {
    res.sendFile(path.join(__dirname + "/html/ambient.html"));
});

router.get("/pressure", function(req, res) {
    res.sendFile(path.join(__dirname + "/html/press.html"));
});

router.get("/humidity", function(req, res) {
    res.sendFile(path.join(__dirname + "/html/hum.html"));
});

router.get("/sound-level", function(req, res) {
    res.sendFile(path.join(__dirname + "/html/mic.html"));
});

router.get("/air-quality", function(req, res) {
    res.sendFile(path.join(__dirname + "/html/gas.html"));
});

app.use(express.static(__dirname));

//add the router
app.use("/", router);

const port = 8000;
app.listen(port, () => {
    console.log(`App running on: ${port}`);
});

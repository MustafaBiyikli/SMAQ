const express = require("express");
const router = require("./router");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = express();

app.use(express.static(__dirname));

//add the router
app.use("/", router);

const port = 8000;
app.listen(port, () => {
    console.log(`App running on: ${port}`);
});

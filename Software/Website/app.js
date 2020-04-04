const express = require("express");
const router = require("./router");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

switch (process.env.NODE_ENV) {
    case "development":
        require("./fakeDataGenerator");
        break;
    case "production":
        require("./udp_receive");
        break;
    default:
        break;
}

const app = express();

app.use(express.static(__dirname));

//add the router
app.use("/", router);

const port = 8000;
app.listen(port, () => {
    console.log(`App running on: ${port}`);
});

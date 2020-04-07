const express = require("express");
const router = require("./router");
const postHandler = require("./postHandler");

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

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(express.json());

app.post("/contact", postHandler.contactForm);
app.post("/settingsAdd", postHandler.userFormAdd);
app.post("/settingsRemove", postHandler.userFormRemove);

const port = 8000;
app.listen(port, () => {
    console.log(`App running on: ${port}`);
});

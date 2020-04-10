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
    case "hosting":
        require("./fakeDataGenerator");
        break;
    default:
        break;
}

// Start express app
const app = express();

// Serving static files
app.use(express.static(__dirname));

// Add the router
app.use("/", router);

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Handle post requests
app.post("/contact", postHandler.contactForm);
app.post("/settingsAdd", postHandler.userFormAdd);
app.post("/settingsRemove", postHandler.userFormRemove);

// Start the server
const port = 8000;
app.listen(port, () => {
    console.log(`App running on: ${port}`);
});

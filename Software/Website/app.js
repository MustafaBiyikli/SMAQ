const express = require("express");
const router = require("./router");
const Email = require("./email");
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
app.use(
    express.urlencoded({
        extended: false,
    })
);
app.use(express.json());

app.post("/contact", async (req, res) => {
    const { fname, lname, email, category, message } = req.body;
    try {
        await new Email(email).sendContactForm(
            fname,
            lname,
            email,
            category,
            message
        );
    } catch (err) {
        throw err.message;
    }
    res.json({ message });
});

const port = 8000;
app.listen(port, () => {
    console.log(`App running on: ${port}`);
});

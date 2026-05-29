const express = require("express");

const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const bodyParser = require("body-parser");

const app = express();

app.use(express.static("public"));


const floors = [
    "A-01",
    "A-02",
    "A-03",
    "B-01",
    "B-02",
    "B-03"
];

app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("view engine", "ejs");

let activeToken = null;

let paymentDone = false;

let users = [];

app.get("/", (req, res) => {
    res.render("gate");
});

app.get("/detect", async (req, res) => {

    paymentDone = false;

    const token = uuidv4();

    activeToken = token;

    const qrURL =
        `http://localhost:3000/login?token=${token}`;

    const qrImage =
        await QRCode.toDataURL(qrURL);

    res.render("qr", {
        qr: qrImage,
        token: token
    });

});
app.get("/status", (req, res) => {
    console.log("STATUS ROUTE HIT");
    res.json({
        paymentDone
    });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});

app.get("/login", (req, res) => {

    const token = req.query.token;

    if (token !== activeToken) {
        return res.send("Invalid Token");
    }

    res.render("login", {
        token: token
    });

});

app.post("/verify", (req, res) => {

    const {
        name,
        email,
        token
    } = req.body;

    if (token !== activeToken) {
        return res.send("Token Expired");
    }

    res.send(`
        <h1>Login Successful</h1>
        <p>Welcome ${name}</p>

        <a href="/plans">
            Continue
        </a>
    `);

});

app.get("/plans", (req, res) => {

    res.send(`

        <h1>Select Parking Plan</h1>

        <a href="/payment?plan=1 Hour&amount=20">
            <button>1 Hour - ₹20</button>
        </a>

        <br><br>

        <a href="/payment?plan=2 Hours&amount=35">
            <button>2 Hours - ₹35</button>
        </a>

        <br><br>

        <a href="/payment?plan=4 Hours&amount=60">
            <button>4 Hours - ₹60</button>
        </a>

        <br><br>

        <a href="/payment?plan=Full Day&amount=100">
            <button>Full Day - ₹100</button>
        </a>

    `);

});

app.get("/payment", (req, res) => {

    res.render("payment", {

        plan: req.query.plan,
        amount: req.query.amount

    });

});

app.post("/payment-success", (req, res) => {

    paymentDone = true;

    const txn =
        "TXN" +
        Math.floor(Math.random() * 1000000);

    const floor =
        Math.floor(Math.random() * 3) + 1;

    const slot =
        "A-" +
        (Math.floor(Math.random() * 20) + 1);

    res.render("success", {

        txn,
        floor,
        slot,
        plan: req.body.plan

    });

});

app.get("/status", (req, res) => {
    res.json({
        paymentDone
    });
});
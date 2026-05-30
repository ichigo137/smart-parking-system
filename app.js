const express = require("express");

const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const bodyParser = require("body-parser");

const app = express();

let parkingStatus = {
    A1: false,
    A2: false,
    B1: false,
    B2: false
};

app.use(express.static("public"));


const floors = [
    "A-01",
    "A-02",
    "B-01",
    "B-02",
];

app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("view engine", "ejs");

let activeToken = null;

let paymentDone = false;

let users = [];

let currentUser = null;

app.get("/", (req, res) => {
    res.render("gate");
});

app.get("/detect", async (req, res) => {

    paymentDone = false;

    const token = uuidv4();

    activeToken = token;

    const qrURL =
    `https://smart-parking-system-dz33.onrender.com/login?token=${token}`;

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

app.get("/api/new-token", (req, res) => {

const token =
Math.random().toString(36).substring(2,8).toUpperCase();
    activeToken = token;

   res.json({
    token,
    url: `https://smart-parking-system-dz33.onrender.com/t/${token}`
});

});

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

aapp.get("/t/:token", (req, res) => {

    activeToken = req.params.token;

    res.redirect(`/login?token=${req.params.token}`);

});

app.post("/verify", (req, res) => {
    const {
    name,
    email,
    phone,
    vehicleNumber,
    vehicleType,
    token
} = req.body;

currentUser = {
    name,
    email,
    phone,
    vehicleNumber,
    vehicleType
};

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
        amount: req.query.amount,
        user: currentUser

    });

});

app.post("/payment-success", (req, res) => {

    const entryTime = new Date().toLocaleString();

    paymentDone = true;

    const txn =
        "TXN" +
        Math.floor(Math.random() * 1000000);

    const slot =
    floors[Math.floor(Math.random() * floors.length)];
    
    const floor = slot.startsWith("A") ? "A" : "B";

    if (slot === "A-01") parkingStatus.A1 = true;
    if (slot === "A-02") parkingStatus.A2 = true;
    if (slot === "B-01") parkingStatus.B1 = true;
    if (slot === "B-02") parkingStatus.B2 = true;


    res.render("success", {

        txn,
        floor,
        slot,
        plan: req.body.plan,
        user: currentUser,
        entryTime

    });

});

app.use(express.json());

app.post("/sensor-update", (req, res) => {

    parkingStatus = req.body;

    console.log(parkingStatus);

    res.json({
        success: true
    });
});

app.get("/parking-status", (req, res) => {
    res.json(parkingStatus);
});

app.get("/dashboard", (req, res) => {

    res.render("dashboard", {
        parkingStatus
    });

});


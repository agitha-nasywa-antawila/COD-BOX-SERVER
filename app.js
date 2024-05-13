if (process.env.NODE_ENV !== "PRODUCTION") require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const hbs = require("hbs");
const app = express();
const PORT = process.env.PORT || 8080;
const ROUTER = require("./router");


app.set("views", "views");
app.set("view engine", "hbs");
app.set('view options', { layout: 'layouts/layout' });
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static("public"));
app.use("/static", express.static("public"));
app.use("/", ROUTER);

app.listen(PORT, () => {
    console.log(`🚀 SERVER RUNNING IN PORT ${PORT}`);
});

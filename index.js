const express = require("express");
const app = express()
const config = require("./config");
const cors = require("cors");

app.use(express.json());
app.use(cors())
const auth = require("./models/auth");
const analysis = require("./models/analysis");
const users = require("./models/users");

app.use("/users", users)
app.use("/analysis", auth, analysis);

app.listen(config.port, () => {
    console.log(`Listening to port ${config.port}...`)
})
const config = require("../config");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    if (req.headers.token) {
        jwt.verify(req.headers.token, config.secret, (err, decoded) => {
            if (err) return res.status(401).send("Unauthorized");
            req.user = decoded;
            console.log(decoded)
            return next();
        });
    } else {
        res.send({ status: 401, message: "Unauthorized" });
    }
};
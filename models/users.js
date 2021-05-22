const { Pool } = require("pg");
const router = require("express").Router();
const config = require("../config");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
    const { error, value } = Joi.object({
        username: Joi.string().required().max(32),
        password: Joi.string().required().max(256)
    }).validate(req.body);
    if (error) return res.send({ status: 400, message: "Bad request", err: error.details[0].message });
    const pool = new Pool(config.DB);
    pool.query("SELECT id, username FROM admins WHERE username = $1 AND password = MD5(MD5(MD5($2)))", [value.username, value.password], (err, resp) => {
        pool.end()
        if (err) {
            console.log(err.message);
            return res.send({ status: 500, message: "Internal server error" })
        }
        if (resp.rowCount == 0) return res.send({ status: 404, message: "User not found" });
        const token = jwt.sign(resp.rows[0], config.secret, { expiresIn: config.token_expire });
        return res.send({ status: 200, message: "Token expires in " + config.token_expire, token: token });
    })
})

router.post("/add", (req, res) => {
    const { error, value } = Joi.object({
        username: Joi.string().required().max(32),
        password: Joi.string().required().max(256)
    }).validate(req.body);
    if (error) return res.send({ status: 400, message: "Bad request", err: error.details[0].message });
    if (req.id == 1) {
        const pool = new Pool(config.DB);
        pool.query("INSERT INTO admins (username, password) VALUES ($1,MD5(MD5(MD5($2))))", [value.username, value.password], (err, resp) => {
            pool.end()
            if (err) {
                console.log(err.message);
                return res.send({ status: 500, message: "Internal server error" })
            }
            return res.send({ status: 200, message: "Admin added successfully" });
        })
    }
    return res.send({ status: 404, message: "Page not found" })
})

module.exports = router
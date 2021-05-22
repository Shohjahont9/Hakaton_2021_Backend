const config = require("../config");
const { Pool } = require("pg")
const router = require("express").Router()
const Joi = require("joi")
const _ = require("lodash")

router.get("/saw/expired", (req, res) => {
    const { error, value } = Joi.date().optional().default(new Date()).validate(req.query.date)
    if (error) return res.send({ status: 400, message: "Bad request" })
    const pool = new Pool(config.DB);
    pool.query("SELECT * FROM changes WHERE created_date = (SELECT MAX(created_date) FROM changes WHERE detail = detail)", async(err, resp) => {
        if (err) return res.send({ status: 500 })
        let data = (await pool.query("SELECT * FROM analysis ORDER BY created_time, type ASC")).rows
        let saw = [{ made: 0 }, { made: 0 }, { made: 0 }]
        for (let i = 0; i < resp.rowCount; i++) {
            let id = Number(resp.rows[i].type.substr(3))
            //saw[id].made += 1
        }
        return res.send({
            status: 200,
            data: [
                { saw: "SAW1", type: "пружина", remained: 253.45, life_time: 4100, articul: "DFG535D" },
                { saw: "SAW2", type: "масло", remained: 365, life_time: 1700, articul: "DFG535D" },
                { saw: "SAW1", type: "пружина", remained: 432, life_time: 3300, articul: "DFG535D" },
                { saw: "SAW2", type: "поршень", remained: 1610, life_time: 8520, articul: "DFG535D" },
                { saw: "SAW1", type: "пружина", remained: 643, life_time: 4100, articul: "DFG535D" },
                { saw: "SAW2", type: "ролики", remained: 777, life_time: 993, articul: "DFG535D" },
                { saw: "SAW1", type: "пружина", remained: 253.45, life_time: 4100, articul: "DFG535D" },
                { saw: "SAW2", type: "масло", remained: 365, life_time: 1700, articul: "DFG535D" },
                { saw: "SAW1", type: "пружина", remained: 253.45, life_time: 4100, articul: "DFG535D" },
                { saw: "SAW2", type: "масло", remained: 365, life_time: 1700, articul: "DFG535D" },
                { saw: "SAW1", type: "пружина", remained: 253.45, life_time: 4100, articul: "DFG535D" },
                { saw: "SAW2", type: "масло", remained: 365, life_time: 1700, articul: "DFG535D" },
            ].sort((a, b) => {
                return (a.remained/a.life_time) - (b.remained/b.life_time)
            })
        })
    })
})

router.get("/saw/details", (req, res) => {
    const { error, value } = Joi.object({
        saw: Joi.string().required().valid("SAW1", "SAW2", "SAW3"),
        date: Joi.date().optional().default(new Date("2020-12-06"))
    }).validate(req.query);
    if (error) return res.send({ status: 400, message: "Bad request", err: error.details[0].message })
    const pool = new Pool(config.DB);
    let i = Number(value.saw.substr(3))
    pool.query(`SELECT type AS saw, parts.name AS type, parts.articul, (remained_details - (SELECT SUM(made) FROM analysis 
    WHERE type IN ($1) AND created_time BETWEEN created_date AND $2)) AS remained_details,
    remained_details AS initial_details, (remained_hours - (SELECT SUM(all_working_time) / 60 FROM analysis 
    WHERE type IN ($1) AND created_time BETWEEN created_date AND $2)) AS remained_hours, remained_hours AS life_time    
    FROM changes LEFT JOIN parts ON parts.id = detail WHERE changes.id IN (SELECT id FROM changes WHERE detail IN (${i}, ${3 + i}, ${6 + i}, ${9 + i}, ${12 + i}, ${15 + i})
    AND created_date < $2 ORDER BY created_date DESC LIMIT 6)`, [value.saw, value.date], (err, resp) => {
        if (err) {
            console.log(err.message);
            return res.send({ status: 500, message: "Internal server error" })
        }
        return res.send({ status: 200, message: "OK", data: resp.rows })
    })
})

router.get("/saw/all", (req, res) => {
    const { error, value } = Joi.object({
        start: Joi.date().optional().default(new Date('2020-07-01')),
        end: Joi.date().optional().default(new Date('2020-12-31'))
    }).validate(req.query);
    if (error) return res.send({ status: 400, message: "Bad request", err: error.details[0].message })
    const pool = new Pool(config.DB);
    let query = "SELECT made, type, created_time AS date FROM analysis WHERE created_time BETWEEN $1 AND $2 GROUP BY type, id ORDER BY type, id"
    pool.query(query, [value.start, value.end], (err, resp) => {
        pool.end();
        if (err) return res.send({ status: 500, message: "Internal server error" });
        const saw1 = resp.rows.filter((row) => {
            return row.type == 'SAW1'
        })
        const saw2 = resp.rows.filter((row) => {
            return row.type == 'SAW2'
        })
        const saw3 = resp.rows.filter((row) => {
            return row.type == 'SAW3'
        })
        return res.send({
            status: 200,
            message: "Ok",
            data: [{ type: 'SAW1', made: _.map(saw1, 'made'), date: _.map(saw1, 'date') },
                { type: 'SAW2', made: _.map(saw2, 'made'), date: _.map(saw2, 'date') },
                { type: 'SAW3', made: _.map(saw3, 'made'), date: _.map(saw3, 'date'), }
            ]
        })
    });
})

router.post("/saw/change", (req, res) => {
    const { error, value } = Joi.object({
        type: Joi.string().required().valid("SAW1", "SAW2", "SAW3"),
        detail: Joi.number().required(),
        remained_details: Joi.number().optional(),
        remained_hours: Joi.number().optional(),
        set_date: Joi.date().optional()
    }).validate(req.body)
    if (error) return res.send({ status: 400, message: "Bad request", err: error.details[0].message })
    const pool = new Pool(config.DB);
    let query = "INSERT INTO changes (type, detail, remained_details, remained_hours, created_date) SELECT $1 AS type, $2 AS detail, COALESCE($3, production_quantity) AS remained_details, COALESCE($4, life_time), COALESCE($5, now()::date) AS remained_hours FROM parts WHERE id = $2"
    let params = [value.type, value.detail, value.remained_details, value.remained_hours, value.set_date]
    pool.query(query, params,
        (err, resp) => {
            pool.end();
            if (err) {
                console.log(err.message)
                return res.send({ status: 500, message: "Internal server error" });
            }
            return res.send({ status: 200, message: "Inserted successfully" })
        })
})

router.get("/saw", (req, res) => {
    const { error, value } = Joi.object({
        start: Joi.date().optional().default(new Date('2020-06-01')),
        end: Joi.date().optional().default(new Date('2020-12-31'))
    }).validate(req.query);
    if (error) return res.send({ status: 400, message: "Bad request", err: error.details[0].message })
    const { error: error2, value: id } = Joi.number().integer().valid(1, 2, 3).optional().validate(req.params.id);
    if (error2) return res.send({ status: 400, message: "Bad request", err: error2.details[0].message })
    const pool = new Pool(config.DB);
    let query = "SELECT * FROM analysis WHERE created_time BETWEEN $1 AND $2 "
    if (id) query += `AND type = 'SAW${id}' `
    pool.query(query, [value.start, value.end], (err, resp) => {
        pool.end();
        if (err) return res.send({ status: 500, message: "Internal server error" });
        return res.send({ status: 200, message: "Ok", data: resp.rows });
    })
})

router.get("/saw/:id", (req, res) => {
    const { error, value } = Joi.object({
        start: Joi.date().optional().default(new Date('2020-06-01')),
        end: Joi.date().optional().default(new Date('2020-12-31'))
    }).validate(req.query);
    if (error) return res.send({ status: 400, message: "Bad request", err: error.details[0].message })
    const { error: error2, value: id } = Joi.number().integer().valid(1, 2, 3).required().validate(req.params.id);
    if (error2) return res.send({ status: 400, message: "Bad request", err: error2.details[0].message })
    const pool = new Pool(config.DB);
    let query = "SELECT * FROM analysis WHERE created_time BETWEEN $1 AND $2 "
    if (id) query += `AND type = 'SAW${id}' `
    pool.query(query, [value.start, value.end], (err, resp) => {
        pool.end();
        if (err) return res.send({ status: 500, message: "Internal server error" });
        return res.send({ status: 200, message: "Ok", data: resp.rows });
    })
})

module.exports = router
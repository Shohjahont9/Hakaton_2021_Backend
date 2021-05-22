const {Pool} = require ("pg");
const config = require ("./config")
const pool = new Pool(config.DB);

module.exports.login = (username, password) => {
    pool.query("SELECT id, username FROM admins WHERE username = $1 AND password = MD5(MD5(MD5($2)))", [username, password], (err, res) => {
        if (err) return console.log(err.message);
        if (res.rowCount == 0) return false;
        return res.rows[0]
    })
}

module.exports.add_user = (username, password) => {
    pool.query("INSERT INTO admins(username, password) VALUES($1, MD5(MD5(MD5($2)))) ON CONFLICT username DO UPDATE password =  MD5(MD5(MD5($2)))", [username, password], (err, res) => {
        if (err) return console.log(err.message);
        return true
    })
}

module.exports.by_type = (type) => {
    pool.query("SELECT * FROM analysis WHERE type = $1", [type], (err, res) => {
        if (err) return console.log("Err")
        return res.rows
    })
}
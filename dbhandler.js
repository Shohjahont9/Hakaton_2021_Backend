const db = require("better-sqlite3")("main.db");

db.prepare("CREATE TABLE IF NOT EXISTS admins (id INTEGER AUTOINCREMENT PRIMARY KEY, username TEXT NOT NULL, password TEXT NOT NULL, created_time TIMESTAMP DEFAULT datetime('now', 'local_time'), CONSTRAINT login UNIQUE(username))").run()

module.exports.add_user = (username, password) => {
    try {
        db.prepare("INSERT INTO admins (username, password) VALUES (?, ?)").run(username, password);
        return true
    }
    catch(err){
        console.log(err.message);
        return false
    }
}

module.exports.login = (username, password) => {
    try {
        const data = db.prepare("SELECT username FROM admins WHERE username = ? AND password = ? LIMIT 1").get(username, password);
        return data;
    }catch(err){    
        console.log(err.message);
        return null
    }
}

module.exports.all_data = (begin, end, limit) => {
    try {
        let data;
        if (limit){
            data = db.prepare("SELECT * FROM analysis_full WHERE ").get(username, password);
        }
        return data;
    }catch(err){    
        console.log(err.message);
        return null
    }
}

module.exports.db = db;
let mysql = require('mysql').createConnection(require('./config').database);

function buildWhereClause(data, joiner) {
    let keys = Object.keys(data);
    let values = Object.values(data);
    let pairs = [], joinedPairs = [];;

    for (let i = 0; i < keys.length; i++) {
        if (values[i] === null) {
            pairs.push(['`' + keys[i] + '`', "IS NULL"]);
        } else if (values[i] === !null) {
            pairs.push(['`' + keys[i] + '`', "IS NOT NULL"]);
        } else {
            pairs.push(['`' + keys[i] + '`', "\"" + values[i] + "\""])
        }

    }

    for (let i = 0; i < pairs.length; i++) {
        if (pairs[i][1] === "IS NULL" || pairs[i][1] === "IS NOT NULL") {
            joinedPairs.push(pairs[i].join(' '));
        } else {
            joinedPairs.push(pairs[i].join(' = '));
        }

    }
    let where = joinedPairs.join(joiner);

    return where;
}

mysql.code = {
    table: 'code',
    find: (id, cb) => {
        mysql.query("SELECT * FROM " + mysql.code.table + " WHERE id = ?", [id], cb);
    },
    findBy: (search, cb) => {
        mysql.query("SELECT * FROM " + mysql.code.table + " WHERE " + buildWhereClause(search, ' and '), cb);
    },
    remove: (id) => {
        mysql.query("DELETE FROM " + mysql.code.table + " WHERE id =?", [id]);
    },
    findOneBy: (search, cb) => {
        mysql.query("SELECT * FROM " + mysql.code.table + " WHERE " + buildWhereClause(search, ' and ') + " Limit 0,1", cb);
    },
    all: (cb) => {
        mysql.query("SELECT * FROM " + mysql.code.table, cb);
    },
    update: (id, data, cb) => {
        mysql.query("UPDATE " + mysql.code.table + " SET ? WHERE id =?", [data, id], cb);
    },
    addMany: (codes) => {
        for (let i = 0; i < codes.length; i++) {
            mysql.query("INSERT INTO " + mysql.code.table + " (code,type) VALUES(?,?)", [codes[i].code, codes[i].type]);
        }
    }
};

module.exports = mysql;
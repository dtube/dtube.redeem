const express = require('express');
const serial = require("generate-serial-key");
const database = require('../utils/database');
const router = express.Router();
const steem = require('steem');

/* GET users listing. */
router.get('/', async (req, res) => {
    steem.api.getAccounts([require('../utils/config').account.name], (err, result) => {
        let account = result[0];
        let balance = account.balance;
        steem.api.getDynamicGlobalProperties((err, result) => {
            const totalSteem = parseFloat(result.total_vesting_fund_steem);
            const totalVests = parseFloat(result.total_vesting_shares);
            const userVests = parseFloat(account.vesting_shares);

            const sp = totalSteem * (userVests / totalVests);
            database.code.findBy({username:null}, (err, results) => {
               let unusedCodes = results;
               database.code.findBy({username:!null}, (err, results) => {
                   let accounts = results

                   res.render('admin/dashboard', {balance,sp:sp.toFixed(3), codes: unusedCodes, accounts});
               })
            });

        })
    });
});

router.get('/getInfo', (req, res) => {
    if (req.query.code) {
        database.code.findOneBy({code: req.query.code}, (err, result) => {
            if (result.length === 1) {
                res.render('admin/getInfo', {code: result[0]})
            } else {
                res.render('admin/getInfo', {not_found: true})
            }
        })
    } else {
        res.render('admin/getInfo')
    }
});

router.get('/codes/create', (req, res) => {
    res.render('admin/codes_create');
});

router.post('/codes/create', (req, res) => {
    let {prefix = null, amount = 0, type = "default"} = req.body;
    if (amount > 0) {
        let codes = [];
        let csv = "";
        for (let i = 0; i < amount; i++) {
            let code = prefix + serial.generate(10, "-", 6);
            codes.push({code, type});
            csv = csv + code + "\r\n";
        }

        database.code.addMany(codes);

        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', 'attachment; filename="codes.csv"');
        res.send(csv);

    }
})

router.get('/codes/:code/delete', (req, res) => {
    database.code.remove(parseInt(req.params.code));
    res.redirect('/admin/codes');
});

router.get('/codes', async (req, res) => {
    database.code.all((err, result) => {
        res.render('admin/codes', {codes: result, host: require('../utils/config').webHost})
    });
});


module.exports = router;

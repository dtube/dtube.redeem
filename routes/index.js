let express = require('express');
let router = express.Router();
let steemconnect = require('../utils/steemconnect');
let database = require('../utils/database');
let steem = require('steem');
let steemHelper = require('../utils/steem');

router.get('/', (req, res) => {
    res.redirect('/r');
});

router.get('/auth', (req, res) => {
    res.redirect(steemconnect.getLoginURL());
});

router.get('/auth/callback', (req, res) => {
    if (!req.query.access_token) {
        res.redirect('/');
    } else {
        steemconnect.setAccessToken(req.query.access_token);
        steemconnect.me((error, account) => {
            req.session.user = account.account;
            res.redirect('/admin');
        })
    }
});

router.get('/v/:code?', (req, res, next) => {
    if (req.params.code) {
        database.code.findOneBy({viewkey: req.params.code}, (err, code) => {
            if (code.length === 1) {
                code = code[0];
                code.credentials = JSON.parse(code.credentials);
                code.credentials.privateKeys = steem.auth.getPrivateKeys(code.username, code.credentials.password, ['posting', 'owner', 'active', 'memo']);
                res.render('account/default', {code});
            } else {
                next()
            }
        })
    } else {
        next();
    }
});

router.get('/r/:code?', (req, res, next) => {
    if (req.params.code) {
        database.code.findOneBy({code: req.params.code}, (err, code) => {

            console.log(err);

            if (code.length === 1) {
                code = code[0];
                if (code.username !== null) {
                    res.render('error/redeemed');
                } else {
                    req.session.code = code;
                    res.render('redeem/' + code.type, {code});
                }
            } else {
                res.render('error/invalid');
            }
        })
    } else {
        res.render('redeem/default');
    }
});

router.post('/r/:code?/:step?', (req, res, next) => {
    if (req.params.code) {
        database.code.findOneBy({code: req.params.code, username: null}, (err, code) => {
            if (code.length === 1) {
                code = code[0];
                if (code.username !== null) {
                    res.render('error/redeemed');
                } else {
                    if (req.params.step) {
                        if (!req.session.hasOwnProperty("code")) {
                            res.redirect('/r/' + req.params.code)
                        } else {
                            if (parseInt(req.params.step) === 1) {
                                res.render('redeem/step_1', {code: req.session.code})
                            } else {
                                let {account = null, fullname = "", previewimage = ""} = req.body;
                                if (!account) {
                                    res.redirect('/r/' + req.session.code.code)
                                } else {
                                    steemHelper.createAccount(req.session.code, account, require('../utils/config').new_account_sp_delegation, fullname, previewimage).then(account => {
                                        res.redirect('/v/' + account.viewkey);
                                    })
                                }
                            }
                        }
                    } else {
                        req.session.code = code;
                        res.render('redeem/' + code.type, {code});
                    }
                }
            } else {
                res.render('error/invalid');
            }
        })
    } else {
        if (req.body.code) {
            res.redirect('/r/' + req.body.code)
        } else {
            res.redirect('/r');
        }

    }
});


module.exports = router;

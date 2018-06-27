async function processSC2User(req, res, next) {
    if (!req.session.user) {
        res.redirect('/auth');
    } else {
        if (!require('./config').admin_accounts.includes(req.session.user.name)) {
            req.session.destroy();
            res.redirect('/');
        } else {
            next();
        }
    }
}

module.exports = {
    processSC2User
};
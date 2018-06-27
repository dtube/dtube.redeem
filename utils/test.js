let steem = require('./steem');
let database = require('./database');
(async () => {

    database.code.findOneBy({id:1}, (err, result) => {
        let token = result[0];
        steem.createAccount(token, "wehmoen.app", 15, "wehmoen.dev",'https://cdn.pixelhosting.co/wvyez8xyd4/0d14d0f409e9d4abe53dab7d88ba0010095f7217d0aa98e4974e266bf75ab3e4.jpeg').then(result => {
            console.log(result);
        })
    });

})()
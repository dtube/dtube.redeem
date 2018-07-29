let fs = require('fs');

let generalConfig = {
    new_account_json_metadata: (name, avatar) => {
        return {
            profile: {
                cover_image: 'http://i.imgur.com/aDFSk5S.jpg',
                name,
                profile_image: avatar
            }
        }
    },
    new_account_sp_delegation: 15,
    webHost: 'http://localhost:8081',
    admin_accounts: ["wehmoen","heimindanger","dtube"]
};

let sysConfig = {
    steemconnect: {
        app: 'steemconnect.app',
        scope: ['login'],
        callbackURL: 'http://localhost:8081/auth/callback',
        baseURL: 'https://steemconnect.com',
    },
    database: {
        host: 'localhost',
        user: 'root',
        password: 'Yesowuhixu',
        database: 'dtube_invite'
    },
    account: {
        name: 'wehmoen',
        wif: '5KRttM3wzropUwdGahNJVWC1Pd7sjh26zR5Jb3BVhWLAnbJGkwY' //testnet key... dont worry
    }
};

if (process.env.env !== "dev") {
    sysConfig = JSON.parse(fs.readFileSync("/mnt/bin/redeem/config.json"));
}


module.exports = Object.assign(generalConfig, sysConfig);

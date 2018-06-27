const serial = require("generate-serial-key");
const steem = require('steem');
const account = require('./config').account;
const database = require('./database');

if (process.env.env === "dev") {
    console.log("===================");
    console.log("USING STEEM TESTNET");
    console.log("===================");

    steem.config.address_prefix = 'STX'
    steem.config.websocket = 'wss://testnet.steem.vc'
    steem.config.chain_id = '79276aea5d4877d9a25892eaa01b0adf019d3e5cb12a97478df3298ccdd01673'
    steem.config.uri = 'https://testnet.steem.vc'
    steem.config.dev_uri = 'https://testnet.steem.vc'
    steem.config.stage_uri = 'https://testnet.steem.vc'

    steem.api.getAccounts(["wehmoen"], (err, result) => {

        if (!JSON.parse(result[0].json_metadata).hasOwnProperty("ip")) {
            console.error("Steem should be on testnet but it is not. PANIC!")
            process.exit(1)
        }

    })
}


async function sp_to_vests(sp) {
    return new Promise((resolve, reject) => {
        steem.api.getDynamicGlobalProperties(function (err2, chainProps) {
            let steem_per_mvest = parseFloat(chainProps.total_vesting_fund_steem) / parseFloat(chainProps.total_vesting_shares);
            let result = Math.round(sp / steem_per_mvest) + '.000000 VESTS';
            resolve(result)
        });
    });
};

async function getFee() {
    return new Promise((resolve, reject) => {
        steem.api.getChainProperties((err, props) => {
            steem.api.getConfig((err, config) => {
                let modifier = config.STEEM_CREATE_ACCOUNT_WITH_STEEM_MODIFIER ? config.STEEM_CREATE_ACCOUNT_WITH_STEEM_MODIFIER : 30;
                resolve((parseFloat(props.account_creation_fee) * modifier).toPrecision(4).toString() + " STEEM")
            })
        });
    })
}

function getNewCredentials(username) {
    if (steem.utils.validateAccountName(username) !== null) {
        return {error: steem.utils.validateAccountName(username)}
    } else {
        let password = steem.formatter.createSuggestedPassword();
        let publicKeys = steem.auth.generateKeys(username, password, ['posting', 'owner', 'active', 'memo']);

        let owner = {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [[publicKeys.owner, 1]]
        };
        let active = {
            weight_threshold: 1,
            account_auths: [[account.name, 1]],
            key_auths: [[publicKeys.active, 1]]
        };
        let posting = {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [[publicKeys.posting, 1]]
        };

        return {username, password, keys: {owner, active, posting, memo: publicKeys.memo}}
    }
}

module.exports = {
    createAccount: async (token, username, sp_delegation, display_name, avatar_url) => {
        let credentials = getNewCredentials(username);
        let fee = await getFee();
        let delegation = await sp_to_vests(sp_delegation);
        let viewkey = serial.generate(20, "-", 5);
       return new Promise((resolve, reject) => {
           steem.broadcast.accountCreateWithDelegation(require('./config').account.wif, fee, delegation, require('./config').account.name, credentials.username, credentials.keys.owner, credentials.keys.active, credentials.keys.posting, credentials.keys.memo, JSON.stringify(require('./config').new_account_json_metadata(display_name,avatar_url)), [], function(err, bcResult) {
               console.log(JSON.stringify({err,result:bcResult,credentials, viewkey}));
               database.code.update(token.id, {credentials: JSON.stringify(credentials),viewkey,used:(new Date()).toISOString().slice(0, 19).replace('T', ' '), username}, (err, result) => {
                    resolve({result:bcResult,credentials, viewkey})
                })
           });
       })
    }
};
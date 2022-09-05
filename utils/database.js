const config = require('config');

let dbUri = null;

if (typeof jest !== 'undefined') {
    dbUri = config.get('db.host') + "/user_roles_test";
} else {
    dbUri = config.get('db.host') + "/user_roles";
}
// console.log(`Yipeekayee: ${dbUri}`);

module.exports.dbUri = dbUri;
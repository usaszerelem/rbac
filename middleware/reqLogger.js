const logger = require('../utils/logger');

function reqLogger(req, res, next) {

    if (req.body != undefined) {
        logger.debug('Request body: ' + JSON.stringify(req.body));
    }

    next();
}

module.exports = reqLogger;

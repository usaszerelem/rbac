const logger = require('../utils/logger');

function reqLogger(req, res, next) {
/*
    if (req.body) {
        logger.debug('Request body: ' + JSON.stringify(req.body));
    } else {
        logger.debug('HTTP Body is empty for this call');
    }
*/
    next();
}

module.exports = reqLogger;

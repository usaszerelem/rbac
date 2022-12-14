const _ = require('underscore');
const logger = require('../utils/logger');

module.exports = function (req, res, next) {
    logger.info('Checking if user is admin');
    logger.debug(`User: ${req.user}`);   
    logger.debug(`Roles: ${req.user.roles}`);

    const result = _.contains(req.user.roles, 'admin');

    if (result === true) {
        logger.info('User is admin' + req.user);
    } else {
        return res.status(403).send('Access denied');
    }

    next();
}
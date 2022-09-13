const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../utils/logger');
const redis = require('../utils/redisCache');

async function authenticate(req, res, next) {
    logger.debug('Authenticating...');

    let token = req.header('x-auth-token');

    if (!token) {
        const message = 'Access denied. No x-auth-token provided';
        logger.error(message);
        return res.status(401).send(message);
    }

    try {
        //let jsonToken = await redis.get(token);

        const privateKey = config.get('jwtPrivateKey');


        logger.debug(`Token: ${token}`);
        logger.debug(`Private key: ${privateKey}`);


        const decoded = jwt.verify(token, privateKey);
        logger.debug('Decoded user information:\n' + JSON.stringify(decoded, null, 4));

        // Add decoded user object to the request
        req.user = decoded;
        next();
    }
    catch(ex) {
        logger.error(ex.message);
        res.status(400).send('Invalid x-auth-token');
    }
}

module.exports = authenticate;
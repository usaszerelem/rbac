const express = require('express');
const config = require('config');
const logger = require('../utils/logger');
const { dbUri } = require('../utils/database');

module.exports = function(app) {
    logger.info(config.get('name'));
    logger.info("NODE_ENV: " + config.get('Environment'));
    logger.info("MONGO_HOST: " + config.get('db.host'));
    logger.info('MongoDB URI: ' + dbUri);

    logger.info('REDIS_PASSWORD: ' + config.get('cache.password'));
    logger.info("AIRFIND_MS_ROLES_TOKEN_EXPIRATION_MS: " + config.get('tokenExpirationMs'));

    logger.debug("AIRFIND_MS_ROLES_JWTPRIVATEKEY: " + config.get('jwtPrivateKey'));

    if (process.env.REDIS_ENABLED) {
        if (!config.get('cache.host')) {
            throw new Error('REDIS_HOST is not defined');
        } else {
            logger.info('REDIS_HOST: ' + config.get('cache.host'));
        }
    
        if (!config.get('cache.port')) {
            throw new Error('REDIS_PORT is not defined');
        } else {
            logger.info('REDIS_PORT: ' + config.get('cache.port'));
        }
    } else {
        logger.info("Redis cached not enabled.");
    }

    if (!config.get('tokenExpirationMs')) {
        throw new Error('AIRFIND_MS_ROLES_TOKEN_EXPIRATION_MS is not defined');
    }

    if (!config.get('jwtPrivateKey')) {
        throw new Error('AIRFIND_MS_ROLES_JWTPRIVATEKEY is not defined');
    }

    if (!config.get('db.host')) {
        throw new Error('MONGO_HOST is not defined');
    }
}

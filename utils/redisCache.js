const config = require('config');
const logger = require('./logger');
const redis = require('redis');

var redisClient = null;

module.exports = {
    // ------------------------------------------------------

    connect: async function() {
        redisClient = redis.createClient(
            config.get('cache.port'),
            config.get('cache.host')
            );

        redisClient
            .on('connect', () => {
                logger.debug('Redis connect')
            })
            .on('ready', () => {
                logger.debug('Redis ready')
            })
            .on('error', (e) => {
                logger.debug('Redis ready', e)
            })
            .on('close', () => {
                logger.debug('Redis close')
            })
            .on('reconnecting', () => {
                logger.debug('Redis reconnecting')
            })
            .on('end', () => {
                logger.debug('Redis end')
            });
             
        await redisClient.connect()
            .then(() => logger.info(`Connected to Redis`))
            .catch(err => logger.error(`Could not connected Redis`, err));
    },

    // ------------------------------------------------------

    set: async function(key, value) {
        try {
            logger.debug(`Setting in cache '${key}' to '${value}'`);
            await redisClient.set(key, value);
            await redisClient.expire(key, config.get('tokenExpirationMs'));
        } catch(ex) {
            logger.error('Redis write error', ex);
            throw ex;
        }
    },

    // ------------------------------------------------------

    get: async function(key){
        var someValue = null;
        logger.debug(`getting value for ${key}`);
        
        try {
            someValue = await redisClient.get(key);
        
            if (someValue == null) {
                logger.debug(`Key in cache not found: ${key}`);
            } else {
                logger.debug('Retrieved from cache: ' + someValue);
            }
        } catch(ex) {
            logger.error('Redis read error', ex);
            throw ex;
        }
    
        return someValue;
    },

    // ------------------------------------------------------

    del: async function(key) {
        try {
            await redisClient.del(key);
        } catch(ex) {
            logger.error('Redis delete error', ex);
            throw ex;
        }
    }
}

const logger = require('../utils/logger');
const redis = require('../utils/redisCache');

module.exports = async function() {
    logger.debug('Connecting to Redis cache ');
    await redis.connect();
}

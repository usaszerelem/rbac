const express = require('express');
const app = express();
const logger = require('./utils/logger');
const config = require('config');

// -------------------------------------------------

logger.debug("Loading ./startup/config");
require('./startup/config')();

logger.debug("Loading ./startup/unhandledExceptions");
require('./startup/unhandledExceptions')();

logger.debug("Loading ./startup/validation");
require('./startup/validation')();

logger.debug("Loading ./startup/prod");
require('./startup/prod')(app);

logger.debug("Loading ./startup/routes");
require('./startup/routes')(app);

logger.debug("Loading ./startup/database");
require('./startup/database')();

if (process.env.REDIS_ENABLED) {
    logger.debug("Loading ./startup/cache");
    require('./startup/cache')();
}

// -------------------------------------------------

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info(`Listening on port ${PORT} ...`);
});

module.exports = server;

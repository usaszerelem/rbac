const { dbUri } = require('../utils/database');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = async function() {
    // -------------------------------------------------
    // https://mongoosejs.com/docs/connections.html
/*
    const MONGO_OPTIONS = {
        useNewUrlParser: true,
        useFindAndModify: false,
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 1000, // Close sockets after 1 seconds of inactivity
        connectTimeoutMS: 1000,
        keepAlive: false,
        poolSize: 5,
        autoReconnect: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    };
*/
    await mongoose.connect(dbUri)
        .then(() => logger.info(`Connected to ${dbUri}...`))
        .catch(err => logger.error(`Could not connected to ${dbUri}...`, err));

    var db = mongoose.connection;
    logger.debug('Using database: ' + db.name);
}

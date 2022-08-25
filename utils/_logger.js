require('express-async-errors');

const {
    createLogger,
    transports,
    format
} = require('winston');

//require('winston-mongodb');

const myConsoleFormat = format.combine(
    format.cli({
        colors: {
            debug: 'brightCyan',
            info: 'brightWhite',
            warn: 'brightYellow',
            error: 'brightRed'
        }}),
    format.errors({ stack: true }),
    format.timestamp(),
    format.printf(({ level, message, timestamp, stack }) => {
        if (stack) {
            // print log trace
            return `${timestamp} ${level}: ${message} - ${stack}`;
        }
        return `${timestamp} ${level}: ${message}`;
    }));

const myLogFormat = format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.printf(({ level, message, timestamp, stack }) => {
        if (stack) {
            // print log trace
            return `${timestamp} ${level}: ${message} - ${stack}`;
        }
        return `${timestamp} ${level}: ${message}`;
    }));

const logger = createLogger({
    transports: [
        new transports.Console({
            level: 'debug',
            format: myConsoleFormat
        })
        /*
        new transports.File({
            filename: 'info.log',
            level: 'info',
            format: myLogFormat
        }),
        new transports.MongoDB({
            level: 'error',
            db: dbUri,
            options: {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            },
            collection: 'appErrors',
            format: myLogFormat
        })
        */
    ]
});

module.exports = logger;

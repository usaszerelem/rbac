const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

if (process.env.REDIS_ENABLED) {
    const redis = require('../utils/redisCache');
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        minlength: 10,
        maxlength: 255,
        lowercase: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'A user must have an email address.'
        }
    },

    password: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1024,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'A user must have a password.'
        }
    },

    roles: {
        type: Array,
        validate: {
            validator: function(v){
                return v && v.length > 0;
            },
            message: 'A user should have at least one role.'
        }
    }
});

// -------------------------------------------------
// Generate an authentication token, replacing an existing
// token if it already exists. 

userSchema.methods.generateAuthToken = async function() {

    // Encode user's ID and roles in a JSON web token that has an expiration
    // expiresIn: 120       // it will be expired after 120ms
    // expiresIn: "10h"     // it will be expired after 10 hours
    // expiresIn: "20d"     // it will be expired after 20 days
    // expiresIn: "120s"    // it will be expired after 120s

    // this returned value can either be an MD5 hash value in case Redis
    // cache is used, or a JWT otherwise.

    var returnedToken = null;

    try {
        // If this user has an active auth token in the cache, remove it
        deleteAuthTokenIfExists(this.email);

        // Now create a new authentication token. 
        const tokenExpireMs = config.get('tokenExpirationMs');
        const privateKey = config.get('jwtPrivateKey');

        /*
        logger.debug(`Creating JSON Web Token with:`);
        logger.debug(`Roles: ${this.roles}`);
        logger.debug(`Private key: ${privateKey}`);
        logger.debug(`Expires: ${tokenExpireMs}`);
        */

        let jsonToken = jwt.sign({ _id: this._id, roles: this.roles },
            privateKey,
            {expiresIn: tokenExpireMs}
            );

        logger.debug(`jsonToken: ${jsonToken}`);

        if (process.env.REDIS_ENABLED) {
            // Create an MD5 hash from the JSON web token and this is what
            // will be returned to the client.

            const salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(jsonToken, salt);

            logger.debug(`Saving user's auth token: ${hash}`);
            await redis.set(hash, jsonToken);

            // This way if there is a need to revoke an auth token for a user,
            // we can easily find it based on the user's email address.

            logger.debug(`Redis saving user email: ${this.email}`);
            await redis.set(this.email, hash);

            returnedToken = hash;
        } else {
            returnedToken = jsonToken;
        }
    } catch(ex) {
        logger.error(ex);
        returnedToken = null;
        throw ex;
    }

    return returnedToken;
}

// -------------------------------------------------

 async function deleteAuthTokenIfExists(userEmail) {
    try {
        if (process.env.REDIS_ENABLED) {
            let token = await redis.get(userEmail);

            if (token) {
                await redis.del(token);
                logger.debug(`Auth token deleted for user ${userEmail}`);

                await redis.del(userEmail);
            }
        }
    } catch(ex) {
        logger.error(`deleteAuthTokenIfExists for ${userEmail}` + ex);
        throw ex;
    }
}

// -------------------------------------------------

function validate(user) {

    const schema = Joi.object({
        email: Joi.string().min(10).max(255).required().email(),
        password: Joi.string().min(4).max(255).required(),
        roles: Joi.array().required()
    });

    return schema.validate(user);
}

const User = mongoose.model('User', userSchema);

module.exports.User = User;
module.exports.validate = validate;

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User } = require('../models/users');
const logger = require('../utils/logger');

// -------------------------------------------------

router.post('/', async (req,res) => {
    logger.debug('Received authentication request:' + JSON.stringify(req.body, null, 4));

    const { error } = validate(req.body);

    if (error) {
        logger.error('Bad validation');
        return res.status(400).send(error.details[0].message);
    }

    // There can only be one user with the same email
    // registered. Check if there is already a user
    // that uses this same email.

    let user = await User.findOne({ email: req.body.email });

    if (!user) {
        logger.error('Invalid email');
        return res.status(400).send('Invalid email or password.');
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if (!validPassword) {
        logger.error('Invalid password');
        return res.status(400).send('Invalid email or password.');
    }

    // Create auth token for user and delete any old token if exists.
    const authToken = await user.generateAuthToken();

    // Intentionally return this minimal data so that the requestor
    // knows the roles for this authenticated user.

    const userMinData = _.pick(user, ['_id', 'email', 'roles']);
    userMinData.authToken = authToken;
    logger.debug('Authenticated user returned: ' + JSON.stringify(userMinData, null, 4));

    res.header('x-auth-token', authToken).send(userMinData);
});

// -------------------------------------------------

function validate(req) {

    const schema = Joi.object({
        email: Joi.string().min(10).max(255).required().email(),
        password: Joi.string().min(4).max(255).required()
    });

    return schema.validate(req);
}

module.exports = router;

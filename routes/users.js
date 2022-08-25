const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const _ = require('lodash');
const { User, validate } = require('../models/users');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

// -------------------------------------------------

router.delete('/', [auth, admin], async (req,res) => {
    logger.info('Received User ID to delete: ' + req.query.id);

    const user = await User.findByIdAndRemove(req.query.id);

    if (!user) {
        logger.info(`User with id ${req.query.id} was not found`);
        return res.status(404).send(`User with id ${req.query.id} was not found`);
    }

    logger.info('User deleted');
    res.send(user);
});

// -------------------------------------------------

router.put('/', [auth, admin], async(req,res) => {
    logger.info('Received ID: ' + req.query.id);

    logger.info('Update user received');
    const { error } = validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    logger.info('Received data', req.body);

    const user = await User.findByIdAndUpdate(
            req.query.id,
            {
                email: req.body.email,
                password: req.body.password,
                roles: req.body.roles
            },
            { new: true }
        );

    if (!user) {
        return res.status(404).send(`User with id ${params.id} was not found`);
    }

    logger.info('User updated');
    res.status(200);
});

// -------------------------------------------------

router.post('/', [auth, admin], async (req,res) => {
    logger.info('User Create - Received', req.body);

    const { error } = validate(req.body);
    
    if (error) {
        logger.info('Bad validation');
        return res.status(400).send(error.details[0].message);
    }

    // There can only be one user with the same email
    // registered. Check if there is already a user
    // that uses this same email.

    let user = await User.findOne({ email: req.body.email });

    if (user) {
        let msg = `User already registered: ${req.body.email}`;
        logger.error(msg);
        return res.status(400).send(msg);
    }

    user = new User( _.pick(req.body, ['email', 'password', 'roles']));

    // Encrypt the user's password

    const salt = await bcrypt.genSalt(10);
    var password = await bcrypt.hash(user.password, salt);
    user.password = password;

    // Save user info to the database

    user = await user.save();
    logger.info('User created' + user);

    // Return minimal information for the created user. Important to note
    // that creation does not mean automatic authentication. This is a 
    // separate call.

    const userMinData = _.pick(user, ['_id', 'email', 'roles']);
    logger.info('Pick returned: ' + JSON.stringify(userMinData, null, 4));

    res.status(200);
});

// -------------------------------------------------
// If we get here we have a user request ID object
// and the user is authorized to obtain information
// about itself

router.get('/me', auth, async (req,res) => {
    logger.info('Received ID: ' + req.user._id);

    // Exclude password and possible other unwanted information
    // from the returned information

    const user = await User.findById(req.user._id).select('-password');

    if (!user)
        return res.status(404).send(`User with id ${req.params.id} was not found`);

    logger.info('Returning user:' + JSON.stringify(user, null, 4));
    res.send(user);
});

// -------------------------------------------------
// This method is only available to administrators
// The requestor has been authorized by the time
// this call is made.
router.get('/', [auth, admin], async (req,res) => {
    logger.info('Received ID: ' + req.query.id);

    let user = null;

    try {
        user = await User.findById(req.query.id).select('-password');
    } catch(e) {
        logger.debug(`User with id ${req.query.id} was not found`);
        logger.debug(e);
    }

    if (!user)
        return res.status(404).send(`User with id ${req.query.id} was not found`);

    res.send(user);
});

module.exports = router;
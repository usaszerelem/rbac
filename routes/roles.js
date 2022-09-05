const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { Role } = require('../models/roles');
const _ = require('lodash');
const logger = require('../utils/logger');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// -------------------------------------------------
// Adds a new role that is ensured to be unique.
// Role is passed in the request body as:
// { "role": "newRoleName" }

router.post('/', [auth, admin], async (req,res) => {
    let isValid = await isRoleNameValidAndUnique(req.body.role);

    if (isValid[0]) {
        return res.status(isValid[0]).send(isValid[1]);
    }

    let newRole = new Role( _.pick(req.body, ['role']));
    
    // Save role to the database
    newRole = await newRole.save();
    logger.info('Role created' + newRole);

    return res.status(200).json(newRole);
});

// -------------------------------------------------
// Updates an existing role's name ensuring that the
// new name is unique.

router.put('/', [auth, admin], async (req,res) => {
    let isValid = await isRoleNameValidAndUnique(req.body.role);

    // The first cell is the error code, if any.
    // The second cell is the informative message.
    if (isValid[0]) {
        res.status(isValid[0]).send(isValid[1]);
        return;
    }

    let role = null;
    
    try {
        role = await Role.findByIdAndUpdate(
            req.body.id,
            {
                role: req.body.role
            },
            { new: true }
        );
    } catch(ex) {
        logger.debug(ex);
        role = null;
    }

    if (!role) {
        res.status(404).send(`Role with id ${req.body.id} was not found`);
    } else {
        logger.info(`Role id ${req.body.id} updated`);
        res.status(200).json(role);
    }
});

// ----------------------------------------------------------------------

router.delete('/', [auth, admin], async (req,res) => {
    let role = null;
    
    try {
        role = await Role.findByIdAndDelete(req.query.id);
    } catch(ex) {
        logger.debug(ex);
        role = null;
    }

    if (!role) {
        res.status(404).send(`Role with id ${req.query.id} was not found`);
    } else {
        logger.info(`Role id ${req.query.id} deleted`);
        res.status(200).json(role);
    }
});

// ----------------------------------------------------------------------
// Return a role based on the role's ID. If none provided then return
// all roles

router.get('/', [auth], async (req,res) => {
    if (req.query.id){
        try {
            const role = await Role.findById(req.query.id);
            res.status(200).json(role);
        } catch(e) {
            logger.debug(`Role with id ${req.query.id} was not found`);
            logger.debug(e);
            res.status(404).send(`Role with id ${req.body.id} was not found`);
        }
    } else {
        const roles = await Role.find().select({role: 1});
        logger.debug('Returning all roles...');
        res.status(200).json(roles);
    }
});

// ----------------------------------------------------------------------

async function isRoleNameValidAndUnique(role) {
    const { error } = validate(role);
    
    if (error) {
        logger.info('Bad validation');
        return [ 400, error.details[0].message ];
    }

    // There can only be one role with the same name

    let roleObj = await Role.findOne({ role: role });

    if (roleObj) {
        let msg = `Role already registered: ${role}`;
        logger.error(msg);
        return [ 400, msg ];
    }

    return[ 0, null ];
}

// ----------------------------------------------------------------------

function validate(role) {

    let some = {
        role: role
    };

    const schema = Joi.object({
        role: Joi.string().min(5).max(50).required()
    });

    return schema.validate(some);
}

module.exports = router;
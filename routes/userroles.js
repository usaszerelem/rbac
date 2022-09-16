const express = require('express');
const router = express.Router();
const { User, validateUser } = require('../models/users');
const { Role } = require('../models/roles');
const logger = require('../utils/logger');
const _ = require('lodash');

// ----------------------------------------------------------------------
// Get the roles associated with a user

router.get('/', async (req,res) => {
    let user = await findUser(req.query.userid);

    if (!user) {
        const msg = `User with id ${req.query.userid} was not found`;
        logger.debug(msg);
        res.status(400).send(msg);
    } else {
        let userRoles = new Array();

        for (let i=0; i < user.roles.length; i++) {
            const role = await Role.findById(user.roles[i]);
            userRoles[i] = _.pick(role, ['_id', 'role']);
        }

        res.status(200).json(userRoles);
    }
});

// ----------------------------------------------------------------------
// Associate new roles with a user

router.post('/', async (req,res) => {
    // Returns [roleArray, roleId].
    let roleRet = await findRoles(req.query.roleid);
    let user = await findUser(req.query.userid);

    if (roleRet[1] > 0) {
        const msg = `Role with id ${roleRet[1]} was not found`;
        logger.debug(msg);
        res.status(400).send(msg);
    } else if (!user) {
        const msg = `User with id ${req.query.userid} was not found`;
        logger.debug(msg);
        res.status(400).send(msg);
    } else if (isAnyRoleAssociatedWithUser(user, roleRet[0]) === true) {
        const msg = `Some roles are already assigned to user id ${req.query.userid}`;
        logger.debug(msg);
        res.status(400).send(msg);
    } else {
        try {
            const query = { "_id": req.query.userid };
            const id = req.query.roleid;

            const updateDocument = {
                $push: { roles: { $each: id.split(',') } }
            };

            await User.updateOne(query, updateDocument);
            const user = await findUser(req.query.userid);

            logger.debug(`Role added to user ${user}`);
            res.status(200).json(user);
        } catch(e) {
            const msg = `Error assigning role ${req.query.roleid} to user id ${req.query.userid}\n${e.message}`;
            logger.error(msg);
            res.status(400).send(msg);
        }
    }
});

// ----------------------------------------------------------------------
// Remove associated roles from a user

router.delete('/', async (req,res) => {
    // Returns [roleArray, roleId].
    let roleRet = await findRoles(req.query.roleid);
    let user = await findUser(req.query.userid);

    if (roleRet[1] > 0) {
        const msg = `Role with id ${roleRet[1]} was not found`;
        logger.debug(msg);
        res.status(400).send(msg);
    } else if (!user) {
        const msg = `User with id ${req.query.userid} was not found`;
        logger.debug(msg);
        res.status(400).send(msg);
    } else if (isAllRolesAssociatedWithUser(user, roleRet[0]) === true) {
        const msg = `Some roles are not assigned to user id ${req.query.userid}`;
        logger.debug(msg);
        res.status(400).send(msg);
    } else {
        try {
            const query = { "_id": req.query.userid };
            const id = req.query.roleid;

            const updateDocument = {
                $pull: { roles: { $each: id.split(',') } }
            };

            await User.updateOne(query, updateDocument);
            const user = await findUser(req.query.userid);

            logger.debug(`Role added to user ${user}`);
            res.status(200).json(user);
        } catch(e) {
            const msg = `Error assigning role ${req.query.roleid} to user id ${req.query.userid}\n${e.message}`;
            logger.error(msg);
            res.status(400).send(msg);
        }
    }
});

// ---------------------------------------------------------------------

function isAnyRoleAssociatedWithUser(user, roleArray) {
    let isRoleAssociated = false;

    for (let i = 0; i < roleArray.length; i++) {
        let oneRole = roleArray[i];

        if (user.roles.includes(oneRole._id)) {
            isRoleAssociated = true;
            break;
        }
    }

    return isRoleAssociated;
}

// ---------------------------------------------------------------------

function isAllRolesAssociatedWithUser(user, roleArray) {
    let isAllRoleAssociated = true;

    for (let i = 0; i < roleArray.length; i++) {
        let oneRole = roleArray[i];

        if (!user.roles.includes(oneRole._id)) {
            isAllRoleAssociated = false;
            break;
        }
    }

    return isAllRoleAssociated;
}

// ---------------------------------------------------------------------
// Given a comma separated list of role IDs, ensures that these are
// valid by looking them up in the Mongo database.
// Return is value pair that should be interpreted as follows:
// retVal[0] - This is an Array of Role objects that correspond to the
//             roleId array received as a paramater. This arrayu of Role
//             objects is only returned if all passed in roleIds are valid.
// retVal[1] - Id of the first roleId that is not
// ---------------------------------------------------------------------

async function findRoles(roleIdList) {
    let roleArray = new Array();
    let roleId = 0;

    try {
        let roleIdArray = roleIdList.split(",");

        for (let i=0; i < roleIdArray.length; i++) {
            roleId = roleIdArray[i];
            let role = await Role.findById(roleId);
            roleArray[i] = role;
        }

        roleId = 0;
    } catch(e) {
        logger.debug(`Role with id ${roleid} was not found`);
        logger.debug(e);
        roleArray = null;
    }

    return [roleArray, roleId];
}

// ---------------------------------------------------------------------

async function findUser(userid) {
    let user = null;

    try {
        user = await User.findById(userid);
    } catch(e) {
        logger.debug(`User with id ${userid} was not found`);
        logger.debug(e);
        user = null;
    }

    return user;
}

module.exports = router;

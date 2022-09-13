const express = require('express');
const router = express.Router();
const { User, validateUser } = require('../models/users');
const { Role } = require('../models/roles');
const logger = require('../utils/logger');

router.post('/', async (req,res) => {
    // Returns [roleArray, roleId].
    // If roleId is a number, that means this roleId could
    // not be found. Otherwise roleArray is expected to contain
    // an array of roles that correspond to the list of roleIds
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
    } else if (isRoleAssociatedWithUser(user, roleRet[0]) === true) {
        const msg = `Some roles are already assigned to user id ${req.query.userid}`;
        logger.debug(msg);
        res.status(400).send(msg);
    } else {
        try {
            const query = { "_id": req.query.userid };
            const id = req.query.roleid;

            /*
            const updateDocument = {
                $push: { "roles": id }
            };
            */
            const updateDocument = {
                $push: { roles: { $each: id.split(',') } }
            };

            console.log(updateDocument);

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

function isRoleAssociatedWithUser(user, roleArray) {
    let isRoleAssociated = false;

    for (let i = 0; i < roleArray.length; i++) {
        let oneRole = roleArray[i];

        if (user.roles.includes(oneRole._id)) {
            isRoleAssociated = true;
            break;
        }
    }
/*
    for (let oneRole in roleArray) {
        if (user.roles.includes(oneRole._id)) {
            isRoleAssociated = true;
            break;
        }
    }
*/
    return isRoleAssociated;
}

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

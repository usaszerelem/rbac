const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

router.get('/', (req,res) => {
    logger.debug("Inside Route Home");
    res.send("RBAC");
});

module.exports = router;

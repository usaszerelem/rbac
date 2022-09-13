const express = require('express');
const users = require('../routes/users');
const auth = require('../routes/auth');
const home = require('../routes/home');
const roles = require('../routes/roles');
const userroles = require('../routes/userroles');
const error = require('../middleware/error');
const requestLogger = require('../middleware/reqLogger');

module.exports = function(app) {
    app.use(express.json());
    app.use(requestLogger);
    app.use('/api/users', users);
    app.use('/api/auth', auth);
    app.use('/api/roles', roles);
    app.use('/api/userroles', userroles);
    app.use('/', home);
    app.use(error);
}

const Joi = require('joi');
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role: {
        type: String,
        unique: true,
        required: true,
        minlength: 5,
        maxlength: 50,
        lowercase: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Invalid role'
        }
    }
});

// -------------------------------------------------


const Role = mongoose.model('Role', roleSchema);

module.exports.Role = Role;

/* eslint-disable import/no-unresolved */
const mongoose = require('mongoose');
// eslint-disable-next-line node/no-missing-require
const validator = require('validator');
//name, email photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please informe your name.'],
    },
    email: {
        type: String,
        required: [true, 'Please informe you email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail],
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: 8,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm you password'],
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

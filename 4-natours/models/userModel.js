const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm you password'],
        validate: {
            //Esse validator só funciona no SAVE e CREATE
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!',
        },
    },
});

userSchema.pre('save', async function (next) {
    //Apenas roda esta função se a senha foi alterada
    if (!this.isModified('password')) return next();

    //Encripta a senha com o custo de 12
    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

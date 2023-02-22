/* $ npm i jsonwebtoken utilizado para autenticação de usuário */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    });

    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Checar se o email e senha existem
    if (!email || !password) {
        next(new AppError('Please provide email and password', 400));
    }

    // 2) Checar se o usuário existe && senha está correta
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or passowrd', 401));
    }

    // 3) se tudo estiver certo, enviar o token para o cliente
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Adquirir o token e checar se ele existe
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    //console.log(token);

    if (!token) {
        return next(
            new AppError(
                'You are not logged in! Please log in to get access',
                401
            )
        );
    }
    // 2) Verificação do token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Checar se o usuário ainda existe
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(
            new AppError('The user belonging to the user no longer exists', 401)
        );
    }

    // 4) Checar se o usuário trocou a senha depois do token ser emitido
    freshUser.changedPasswordAfter(decoded.iat);
    next();
});



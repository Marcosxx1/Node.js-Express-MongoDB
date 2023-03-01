/* $ npm i jsonwebtoken utilizado para autenticação de usuário */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,

        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        passWordChangedAt: req.body.passWordChangedAt,
        role: req.body.role,
    });

    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 10000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};

//Apenas para páginas renderizadas, não haverá erros
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        // 2) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return next();
        }
  
        // 3) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next();
        }
  
        // THERE IS A LOGGED IN USER
        res.locals.user = currentUser;
        return next();
      } catch (err) {
        return next();
      }
    }
    return next();
  };

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Adquirir o token e checar se ele existe
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (!req.cookies.jwt) {
        token = req.cookes.jwt;
    }
    if (!token) {
        //console.log(token);

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
    const curentUser = await User.findById(decoded.id);
    if (!curentUser) {
        return next(
            new AppError('The user belonging to the user no longer exists', 401)
        );
    }

    // 4) Checar se o usuário trocou a senha depois do token ser emitido
    if (curentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            AppError('User reently changed password! Please log in again', 401)
        );
    }

    // Permite acesso a rota protegita
    req.user = curentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //Funções ['admin', 'lead-guide']. role ='user'

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1 ) get user baed on POSTed email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('There is no user with this email', 404));
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3 ) Send its to user email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}}`;

    const message = `Forgot you password? submit a PATCH request with your new password and confirmPassword to: ${resetURL} .\nif you idn't forget your passowrd, please ifnore this email`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'There was an error sending the email, try again later'
            ),
            500
        );
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) if token has not expired, an there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or expired!'));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changePasswordAt property for the user

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get the user from the collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if the POSTed current password is correct
    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) Check if the new password is the same as the current password
    if (req.body.passwordCurrent === req.body.password) {
        return next(
            new AppError(
                'Your new password cannot be the same as the current password.',
                400
            )
        );
    }

    // 4) Validate the confirmPassword field
    if (!req.body.confirmPassword) {
        return next(new AppError('Please confirm your password.', 400));
    }

    // 5) Check if the new password and the confirmPassword fields match
    if (req.body.password !== req.body.confirmPassword) {
        return next(new AppError('Passwords do not match.', 400));
    }

    // 6) If everything is OK, update the password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // 7) Log the user in, send JWT
    createSendToken(user, 200, res);
});

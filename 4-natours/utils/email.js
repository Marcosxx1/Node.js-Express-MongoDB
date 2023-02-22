const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Criar um transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2) Definir as opções de email
    const mailOptions = {
        from: 'Marcos Alex <admin@email.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    // 3) Enviar o email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

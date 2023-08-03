const nodemailer = require('nodemailer');

const mailSend = async function (data) {
    let emailAccount = {
        name: process.env.emailName,
        email: process.env.emailEmail,
        password: process.env.emailPassword
    };

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailAccount.email,
            pass: emailAccount.password
        }
    });
    var mailOptions = {
        from: emailAccount.name + emailAccount.email,
        to: data.email,
        subject: data.subject,
        html: data.html
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = mailSend;

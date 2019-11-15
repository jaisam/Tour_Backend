const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create a transporter
    let transporter;
    if(process.env.NODE_ENV === 'production') {
        transporter = nodemailer.createTransport({
            service : 'SendGrid',
            auth: {
                user: process.env.SEND_GRID_SMTP_USERNAME,
                pass: process.env.SEND_GRID_SMTP_PASSWORD
            }
        });
    }
     transporter = nodemailer.createTransport({
        host: process.env.MAIL_TRAP_EMAIL_HOST,
        port: process.env.MAIL_TRAP_EMAIL_PORT,
        auth: {
            user: process.env.MAIL_TRAP_EMAIL_USERNAME,
            pass: process.env.MAIL_TRAP_EMAIL_PASSWORD
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Jai Samtani <jaisamtani123@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
        //html :
    };
    console.log("sending email");
    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
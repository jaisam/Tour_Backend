const nodemailer = require('nodemailer');

class Email {
    constructor(user, url) {
        this.userName = user.name,
            this.to = user.email,
            this.from = process.env.EMAIL_FROM,
            this.url = url

    }

    myTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: 'SendGrid',
                // host: process.env.SEND_GRID_EMAIL_HOST,
                // port: process.env.SEND_GRID_EMAIL_PORT,
                auth: {
                    user: process.env.SEND_GRID_SMTP_USERNAME,
                    pass: process.env.SEND_GRID_SMTP_PASSWORD
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.MAIL_TRAP_EMAIL_HOST,
            port: process.env.MAIL_TRAP_EMAIL_PORT,
            auth: {
                user: process.env.MAIL_TRAP_EMAIL_USERNAME,
                pass: process.env.MAIL_TRAP_EMAIL_PASSWORD
            }
        });
    }

    async send(subject, message) {
        // 1) Create a transporter
        let transporter = this.myTransport();

        // 2) Mail Options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text: message
            //html :
        };

        // 3) send Email
        console.log('Sending Email...');
        await transporter.sendMail(mailOptions);
    }


    async forgotPasswordMail() {
        await this.send(
            'Reset Password',
            `Hi ${this.userName},\n 
            Forgot Password? No Problem!
            \n
            Reset your password by submitting new password at below link : \n
            ${this.url} \n
            Please ignore this email, if you did not request a password reset.
            \n
            Thanks and Regards,
            Tours team.`
        );
    }

    async resetPasswordMail() {
        await this.send(
            'Password Resetted Successfully',
            `Hi ${this.userName},\n 
            Your password is resetted successfully. PLease login again to check interesting tours!
            \n
            Thanks and Regards,
            Tours team.`
        );
    }

    async welcomeMail() {
        await this.send(
            'Welcome to Tours website!',
            `Hi ${this.userName},\n 
            We're glad you're here! Check out our interesting Tours. We can't wait to see you enjoy our tours.\n
            \n
            Thanks and Regards,
            Tours team.`
        );
    }

}



// const sendEmail = async options => {
//     // 1) Create a transporter
//     let transporter;
//     transporter = nodemailer.createTransport({
//         host: process.env.MAIL_TRAP_EMAIL_HOST,
//         port: process.env.MAIL_TRAP_EMAIL_PORT,
//         auth: {
//             user: process.env.MAIL_TRAP_EMAIL_USERNAME,
//             pass: process.env.MAIL_TRAP_EMAIL_PASSWORD
//         }
//     });

//     // 2) Define the email options
//     const mailOptions = {
//         from: 'Jai Samtani <jaisamtani123@gmail.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//         //html :
//     };
//     console.log("sending email");
//     // 3) Actually send the email
//     await transporter.sendMail(mailOptions);
// }

module.exports = Email;
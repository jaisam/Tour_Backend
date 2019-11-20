const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');


class Email {
    constructor(user, url) {
        this.firstName = user.name.split(' ')[0],
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

    async send(subject, template) {
        // 1) Render HTML from pug template and Create a transporter
        // Below line will convert pug file content into HTML, in mailOptions HTML need to be sent, not pug template
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`, // location of pug file
            { // Object which has list of variables which we need to dynamically update in pug template
                firstName : this.firstName,
                url : this.url,
                subject
            });
        let transporter = this.myTransport();

        // 2) Mail Options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html) // convert HTML file into text only. it will just have innerHTML contents and remove <p>,<a>,etc

        };

        // 3) send Email
        console.log('Sending Email...');
        await transporter.sendMail(mailOptions);
    }


    async forgotPasswordMail() {
        await this.send(
            'Reset Password Mail(Valid only for 10 mins)',
            'passwordReset'
        );
    }

    // async resetPasswordMail() {
    //     await this.send(
    //         'Password Resetted Successfully',
    //         `Hi ${this.firstName},\n 
    //         Your password is resetted successfully. PLease login again to check interesting tours!
    //         \n
    //         Thanks and Regards,
    //         Tours team.`
    //     );
    // }

    async welcomeMail() {
        await this.send(
            'Welcome to Tours website!',
            'welcome'
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
import nodemailer from 'nodemailer';
import env from '../env.js'

async function sendEmail(recieversEmail: string, verificationToken: string,): Promise<Boolean> {
    try {
        const transporter = nodemailer.createTransport({
            host: env.HOST,
            port: Number(env.PORT),
            secure: false,
            auth: {
                user: env.HOST_MAIL,
                pass: env.APP_PASS
            }
        })


        const mailOptions: nodemailer.SendMailOptions = {
            from: env.HOST_MAIL,
            to: recieversEmail,
            subject: "For email verification",
            html: `<h1>This for your email confirmation</h1>. 
        Please click the link <a href='${env.FRONTEND_URL}/verifyemail/${verificationToken}'> Here </a>
        `
        }

        transporter.sendMail(mailOptions);
    }

    catch (error) {
        console.log("[ERROR]: error in sending email", error);
        return false;
    }

    return true;
}

export { sendEmail }
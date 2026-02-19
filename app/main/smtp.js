const nodemailer = require('nodemailer');

const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

const transporter = nodemailer.createTransport(smtpConfig);

async function send2FACode(email, code) {
    try {
        const info = await transporter.sendMail({
            from: `"Studyium Security" <${smtpConfig.auth.user}>`,
            to: email,
            subject: "Your Studyium Login Verification Code",
            text: `Your verification code is: ${code}`,
            html: `<b>Your verification code is: ${code}</b><br>Do not share this code with anyone.`,
        });
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}

module.exports = {
    send2FACode
};

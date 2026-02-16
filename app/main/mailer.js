const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'kagantosun@studyium.com',
        pass: 'Kagantosun_123'
    }
});

async function sendVerificationEmail(to, name, code, type = 'register') {
    let subject, title, intro, actionText;

    if (type === 'login') {
        subject = "Studyium Giriş Doğrulama";
        title = `Tekrar Hoşgeldiniz, ${name}!`;
        intro = "Hesabınıza yeni bir giriş denemesi yapıldı veya doğrulama süreniz doldu.";
        actionText = "Giriş yapmak için aşağıdaki kodu kullanınız:";
    } else {
        subject = "Studyium Hesabınızı Doğrulayın";
        title = `Hoşgeldiniz, ${name}!`;
        intro = "Studyium ailesine katıldığınız için teşekkür ederiz.";
        actionText = "Hesabınızı doğrulamak için lütfen aşağıdaki kodu kayıt ekranına giriniz:";
    }

    const html = `
    <div style='font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: 0 auto;'>
        <h2 style='color: #4F46E5;'>${title}</h2>
        <p>${intro}</p>
        <p>${actionText}</p>
        <div style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; margin: 20px 0;'>${code}</div>
        <p style='font-size: 12px; color: #666;'>Bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.</p>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: '"Studyium" <kagantosun@studyium.com>',
            to: to,
            subject: subject,
            html: html
        });
        return true;
    } catch (error) {
        console.error("Email send error:", error);
        return false;
    }
}

module.exports = { sendVerificationEmail };

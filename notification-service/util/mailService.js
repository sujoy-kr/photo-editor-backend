const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
    },
})

const sendEmail = async (to, message) => {
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to,
        subject: 'Photo Editor',
        text: message,
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log('email sent to ', to)
        console.log('email:', message)
    } catch (err) {
        console.log('nodemailer error', err)
    }
}

module.exports = { sendEmail }

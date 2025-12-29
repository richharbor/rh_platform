const nodemailer = require("nodemailer");
// const fs = require("fs"); // Unused in this snippet, keeping commented out or removing for cleanliness

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendEmail = async (to, subject, content, isHtml = true) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            [isHtml ? "html" : "text"]: content,
        });
        console.log("Email sent: " + info.response);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        // Throw error to let controller know it failed? 
        // Or just log. User didn't specify error handling, but returning info/error is good practice.
        throw error;
    }
};

module.exports = {
    sendEmail
};

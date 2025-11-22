// Lazy initialization - only create mailjet client when needed
let mailjetClient = null;

const getMailjetClient = () => {
    if (!mailjetClient) {
        const apiKey = process.env.AMSA_MAILJET_API_KEY;
        const secretKey = process.env.AMSA_MAILJET_SECRET_KEY;
        
        if (!apiKey || !secretKey) {
            console.error('Warning: Mailjet credentials not configured. Email functionality will not work.');
            return null;
        }
        
        mailjetClient = require('node-mailjet').apiConnect(apiKey, secretKey);
    }
    return mailjetClient;
};

const sendEmail = async function (toEmail, subject, html) {
    try {
        const mailjet = getMailjetClient();
        
        if (!mailjet) {
            console.error('Cannot send email: Mailjet not configured');
            return { message: 'Email service not configured' };
        }
        
        const request = mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: 'sukhbat@amsa.mn',
                            Name: 'AMSA'
                        },
                        To: [
                            {
                                Email: toEmail
                            }
                        ],
                        Subject: subject,
                        TextPart: 'Password reset email',
                        HTMLPart: html
                    }
                ]
            });

        const result = await request;
        console.log('Email sent!', result.body);
        return { message: 'success' };
    } catch (e) {
        console.error('Mailjet error', e);
        throw new Error('Failed to send email');
    }
};

module.exports.sendEmail = sendEmail;



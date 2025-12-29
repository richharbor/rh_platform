const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { Otp } = require("../models");

const REGION = process.env.AWS_REGION || 'ap-south-1';

// Initialize SNS Client (V3)
const snsClient = new SNSClient({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

exports.sendSnsOtp = async (phoneNumber, code) => {
    try {
        const otp = code; // Use passed code

        console.log(`[AWS SNS] Sending OTP for ${phoneNumber}: ${otp}`);

        // DB storage is now handled by the controller to avoid duplicates/mismatches

        // 1. If no credentials, stop here (Dev Mode)
        if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'your_aws_access_key') {
            console.log(`[AWS MOCK] Credentials missing. Mock success.`);
            return { success: true, message: 'OTP sent (mock)' };
        }

        // 2. Send Real SMS via AWS SNS V3
        const params = {
            Message: `Your Rich Harbor verification code is: ${otp}`,
            PhoneNumber: phoneNumber,
            MessageAttributes: {
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                }
            }
        };

        const command = new PublishCommand(params);
        const result = await snsClient.send(command);

        console.log(`[AWS SNS] OTP sent to ${phoneNumber}: ${result.MessageId}`);
        return { success: true, messageId: result.MessageId };

    } catch (error) {
        console.error('[AWS SNS Error]', error);
        // Fail open for dev if needed, or return error
        return { success: false, error: error.message };
    }
};

exports.verifySnsOtp = async (phoneNumber, code) => {
    // Find latest OTP for this phone
    // Note: 'createdAt' might be 'created_at' depending on underscored setting.
    // Our model defined underscored: true, so DB column is created_at, but Sequelize model field is createdAt usually unless mapped.
    // Let's check Otp.js. timestamps: true, underscored: true. 
    // Sequelize maps 'createdAt' (JS) -> 'created_at' (DB). So we query 'createdAt' in where/order.

    const record = await Otp.findOne({
        where: { phone: phoneNumber },
        order: [['createdAt', 'DESC']]
    });

    if (!record) {
        return { valid: false, message: 'OTP not requested or expired' };
    }

    if (Date.now() > record.expires_at) {
        // Optional: delete old record?
        return { valid: false, message: 'OTP expired' };
    }

    if (record.code_hash !== code) {
        return { valid: false, message: 'Invalid OTP' };
    }

    // Success - mark used and delete
    await record.destroy();
    return { valid: true };
};

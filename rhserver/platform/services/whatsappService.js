const axios = require('axios');

const WHATSAPP_API_BASE_URL = 'https://waise.in/api/v1';

/**
 * Send OTP via WhatsApp template message
 * @param {string} phoneNumber - Phone number with country code (e.g., "918098218217")
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */


exports.sendWhatsAppOtp = async (phoneNumber, code) => {
    try {
        console.log(`[WhatsApp OTP] Sending OTP to ${phoneNumber}: ${code}`);

        // Dev Mode Check - skip actual API call if credentials are missing
        if (!process.env.WHATSAPP_OTP_API_KEY || !process.env.WHATSAPP_OTP_API_SECRET) {
            console.log(`[WhatsApp MOCK] Credentials missing. Mock success.`);
            return { success: true, message: 'OTP sent (mock)' };
        }

        // Clean phone number - ensure it's in the format without '+' or spaces
        const cleanPhone = phoneNumber.replace(/[+\s-]/g, '');

        // Prepare WhatsApp template payload
        const payload = {
            to: cleanPhone,
            template_name: "rfin_app_otp",
            language_code: "en_US",
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: code
                        }
                    ]
                },
                {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [
                        {
                            type: "text",
                            text: "2" // Button parameter (if needed by template)
                        }
                    ]
                }
            ]
        };

        // Prepare Authorization header in format: Bearer <api_key>:<api_secret>
        const authToken = `${process.env.WHATSAPP_OTP_API_KEY}:${process.env.WHATSAPP_OTP_API_SECRET}`;

        // Make API request
        const response = await axios.post(
            `${WHATSAPP_API_BASE_URL}/whatsapp/send-template`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                timeout: 10000 // 10 second timeout
            }
        );

        console.log(`[WhatsApp OTP] Successfully sent to ${phoneNumber}. Response:`, response.data);

        return {
            success: true,
            messageId: response.data.message_id || response.data.id,
            data: response.data
        };

    } catch (error) {
        console.error('[WhatsApp OTP Error]', {
            phone: phoneNumber,
            error: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

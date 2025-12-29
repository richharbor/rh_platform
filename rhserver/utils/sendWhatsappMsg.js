const axios = require("axios");
require('dotenv').config();

const WHATSAPP_API_VERSION = "v24.0";


const sendWhatsAppTestMessage = async (title, desc, number) => {
    const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
    const data = {
        messaging_product: "whatsapp",
        to: number, // your test number
        type: "template",
        template: {
            name: "hello_world",
            language: {
                code: "en_US"
            }
        }
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Message sent successfully:", response.data);
        return response.data;

    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    sendWhatsAppTestMessage
};
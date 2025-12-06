import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let client;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export const sendSMS = async (to, body) => {
  if (!client) {
    console.warn("Twilio client not initialized. Check environment variables.");
    return null;
  }

  try {
    const message = await client.messages.create({
      body,
      from: fromPhone,
      to,
    });
    return message;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

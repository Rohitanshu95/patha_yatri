import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = process.env.TWILIO_SID && process.env.TWILIO_TOKEN !== "token_replace_me"
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
  : null;

export const sendBookingConfirmation = async (contact, details) => {
  if (!client) {
    console.log("[SMS Stub] Booking Confirmation to", contact, ":", details);
    return;
  }
  try {
    await client.messages.create({
      body: `Patha Yatri: Your booking is confirmed. Room: ${details.roomNumber}`,
      from: process.env.TWILIO_PHONE,
      to: contact,
    });
  } catch (error) {
    console.error("SMS Error:", error);
  }
};

export const sendCheckoutReminder = async (contact, details) => {
  if (!client) {
    console.log("[SMS Stub] Checkout Reminder to", contact, ":", details);
    return;
  }
  try {
    await client.messages.create({
      body: `Patha Yatri: Reminder for checkout today at 11 AM.`,
      from: process.env.TWILIO_PHONE,
      to: contact,
    });
  } catch (error) {
    console.error("SMS Error:", error);
  }
};
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
      body: `Patha Yatri: Booking confirmed. Room ${details.roomNumber} (${details.roomCategory}). Check-in ${details.checkInDate}, Check-out ${details.checkOutDate}.`,
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
      body: `Patha Yatri: Checkout completed for Room ${details.roomNumber}. We hope you enjoyed your stay!`,
      from: process.env.TWILIO_PHONE,
      to: contact,
    });
  } catch (error) {
    console.error("SMS Error:", error);
  }
};
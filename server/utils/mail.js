import nodemailer from "nodemailer";
import { bookingMailTemplate } from "./templates/booking_mail.js";
import { invoiceMailTemplate } from "./templates/invoice_receiving_mail.js";
import { bookingCancelMailTemplate } from "./templates/booking_cancel_mail.js";

// Ensure environment variables are loaded (usually handled in index.js)
// Default fallback to the official company email provided by user
const SENDER_EMAIL = process.env.SMTP_USER || "itzrohit991@gmail.com";
// Important: Ensure you set SMTP_PASS in your .env file
const SENDER_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASS,
  },
});

/**
 * Sends a welcome booking confirmation email
 * @param {Object} params - The booking details
 * @param {string} params.to - Guest email
 * @param {string} params.guestName - Guest name
 * @param {string} params.bookingId - Unique booking ID
 * @param {string} params.roomType - Room category/details
 * @param {string} params.checkInDate - Formatted check-in date
 * @param {string} params.checkOutDate - Formatted check-out date
 */
export const sendBookingMail = async ({ to, guestName, bookingId, roomType, checkInDate, checkOutDate }) => {
  try {
    const htmlContent = bookingMailTemplate({ 
      guestName, 
      bookingId, 
      roomType, 
      checkInDate, 
      checkOutDate 
    });

    const mailOptions = {
      from: `"Patha Yatri Hotel" <${SENDER_EMAIL}>`,
      to,
      subject: "Booking Confirmation - Welcome to Patha Yatri!",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Booking email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending booking email:", error);
    throw error;
  }
};

/**
 * Sends a checkout thank you and invoice email
 * @param {Object} params - The invoice details
 * @param {string} params.to - Guest email
 * @param {string} params.guestName - Guest name
 * @param {string} params.billId - Invoice reference number
 * @param {string} params.totalAmount - Total final amount
 * @param {string} params.checkOutDate - Formatted checkout date
 */
export const sendInvoiceMail = async ({ to, guestName, billId, totalAmount, checkOutDate, attachments = [] }) => {
  try {
    const htmlContent = invoiceMailTemplate({ 
      guestName, 
      billId, 
      totalAmount, 
      checkOutDate 
    });

    const mailOptions = {
      from: `"Patha Yatri Hotel" <${SENDER_EMAIL}>`,
      to,
      subject: "Thank You for Your Stay - Your Invoice Inside",
      html: htmlContent,
      ...(attachments.length ? { attachments } : {}),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Invoice email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending invoice email:", error);
    throw error;
  }
};

/**
 * Sends a booking cancellation email
 * @param {Object} params - The cancellation details
 * @param {string} params.to - Guest email
 * @param {string} params.guestName - Guest name
 * @param {string} params.bookingId - Unique booking ID
 * @param {string} params.roomType - Room category/details
 * @param {string} params.cancelledAt - Formatted cancellation date
 */
export const sendCancellationMail = async ({ to, guestName, bookingId, roomType, cancelledAt }) => {
  try {
    const htmlContent = bookingCancelMailTemplate({
      guestName,
      bookingId,
      roomType,
      cancelledAt,
    });

    const mailOptions = {
      from: `"Patha Yatri Hotel" <${SENDER_EMAIL}>`,
      to,
      subject: "Booking Cancelled - Patha Yatri Hotel",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Cancellation email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending cancellation email:", error);
    throw error;
  }
};

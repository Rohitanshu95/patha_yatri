export const bookingMailTemplate = ({ guestName, bookingId, roomType, checkInDate, checkOutDate }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background-color: #1e3a8a; padding: 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
    .content h2 { color: #1e3a8a; font-size: 20px; text-align: center; margin-bottom: 25px; }
    .details-card { background-color: #f8fafc; border-left: 4px solid #1e3a8a; padding: 20px; border-radius: 4px; margin: 30px 0; }
    .details-card table { width: 100%; border-collapse: collapse; }
    .details-card td { padding: 8px 0; font-size: 15px; }
    .details-card td:first-child { color: #64748b; font-weight: 600; width: 40%; }
    .details-card td:last-child { color: #0f172a; font-weight: 500; text-align: right; }
    .main-button { display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; text-align: center; }
    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PATHA YATRI HOTEL</h1>
    </div>
    <div class="content">
      <h2>Your Booking is Confirmed!</h2>
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>Thank you for choosing Patha Yatri Hotel. We are delighted to confirm your recent room reservation and look forward to hosting you soon.</p>
      
      <div class="details-card">
        <table>
          <tr>
            <td>Booking ID:</td>
            <td>#${bookingId}</td>
          </tr>
          <tr>
            <td>Room Details:</td>
            <td>${roomType}</td>
          </tr>
          <tr>
            <td>Check-In:</td>
            <td>${checkInDate}</td>
          </tr>
          <tr>
            <td>Check-Out:</td>
            <td>${checkOutDate}</td>
          </tr>
        </table>
      </div>
      
      <p style="text-align: center;">Get ready for an incredible stay at Patha Yatri. You can explore our amenities and plan your trip on our website.</p>
      <div style="text-align: center;">
        <a href="https://pathayatri.com" class="main-button">Explore Patha Yatri</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Patha Yatri Hotel. All rights reserved.<br>
      Thank you for being our valued guest.
    </div>
  </div>
</body>
</html>
  `;
};

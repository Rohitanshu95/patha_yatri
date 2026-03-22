export const invoiceMailTemplate = ({ guestName, billId, totalAmount, checkOutDate }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Invoice</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background-color: #10b981; padding: 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
    .content h2 { color: #10b981; font-size: 20px; text-align: center; margin-bottom: 25px; }
    .invoice-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 25px; margin: 30px 0; background-color: #fafafa; }
    .invoice-box table { width: 100%; border-collapse: collapse; }
    .invoice-box th { border-bottom: 2px solid #e5e7eb; text-align: left; padding: 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; }
    .invoice-box td { padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-size: 15px; color: #1f2937; }
    .invoice-box td.amount { text-align: right; font-weight: 600; }
    .total-row td { font-size: 18px; font-weight: 700; color: #111827; padding-top: 20px; border-bottom: none; }
    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PATHA YATRI HOTEL</h1>
    </div>
    <div class="content">
      <h2>Thank You for Your Stay!</h2>
      <p>Dear <strong>${guestName}</strong>,</p>
      <p>We hope you had a wonderful and comfortable stay with us. Your checkout is complete, and we have generated your final invoice.</p>
      
      <div class="invoice-box">
        <table>
          <tr>
            <th colspan="2">Invoice Details</th>
          </tr>
          <tr>
            <td><strong>Invoice No:</strong></td>
            <td class="amount">#${billId}</td>
          </tr>
          <tr>
            <td><strong>Date:</strong></td>
            <td class="amount">${checkOutDate}</td>
          </tr>
          <tr class="total-row">
            <td>TOTAL AMOUNT PAID</td>
            <td class="amount">₹${totalAmount}</td>
          </tr>
        </table>
      </div>
      
      <p style="text-align: center; margin-top: 30px;">We would love to welcome you back to Patha Yatri Hotel in the near future. Have a safe journey home!</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Patha Yatri Hotel. All rights reserved.<br>
      For any billing discrepancies, please reply to this email.
    </div>
  </div>
</body>
</html>
  `;
};

export const invoicePdfTemplate = ({
  hotel,
  invoice,
  guest,
  stay,
  items,
  totals,
  payments,
  assets,
  amountInWords,
}) => {
  const logoImg = assets?.logoBase64
    ? `<img src="${assets.logoBase64}" alt="Logo" class="logo" />`
    : "";
  const watermarkStyle = assets?.watermarkBase64
    ? `background-image: url('${assets.watermarkBase64}');`
    : "";
  const signatureImg = assets?.signatureBase64
    ? `<img src="${assets.signatureBase64}" alt="Signature" class="signature-img" />`
    : "";
  const footerLeftImg = assets?.footerLeftBase64
    ? `<img src="${assets.footerLeftBase64}" alt="Footer Logo" class="footer-logo" />`
    : "";
  const footerRightImg = assets?.footerRightBase64
    ? `<img src="${assets.footerRightBase64}" alt="Footer Logo" class="footer-logo" />`
    : "";

  const rowsHtml = items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.label}</td>
          <td class="text-center">${item.qty ?? "-"}</td>
          <td class="text-right">${item.rate}</td>
          <td class="text-right">${item.amount}</td>
        </tr>
      `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; }
    .page { width: 794px; min-height: 1123px; margin: 0 auto; background: #ffffff; padding: 24px 32px 28px; position: relative; overflow: hidden; }
    .page::before {
      content: "";
      position: absolute;
      inset: 0;
      opacity: 0.18;
      background-repeat: no-repeat;
      background-position: center;
      background-size: 70% auto;
      ${watermarkStyle}
      pointer-events: none;
      z-index: 0;
    }
    .page > * { position: relative; z-index: 1; }
    .top-bar { height: 10px; background: #e54b4b; margin: -24px -32px 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo { width: 56px; height: 56px; object-fit: contain; }
    .brand h1 { font-size: 20px; letter-spacing: 3px; margin: 0; }
    .brand p { margin: 4px 0 0; font-size: 10px; color: #6b7280; letter-spacing: 2px; text-transform: uppercase; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { margin: 0; font-size: 20px; letter-spacing: 2px; }
    .invoice-meta p { margin: 6px 0 0; font-size: 11px; color: #4b5563; }
    .hotel-block { margin-top: 18px; display: flex; justify-content: space-between; gap: 24px; }
    .hotel-details h3 { margin: 0; font-size: 16px; }
    .hotel-details p { margin: 4px 0; font-size: 11px; color: #4b5563; }
    .divider { border-top: 2px solid #111827; margin: 18px 0; }
    .guest-box { background: #fffaf4; border-radius: 8px; padding: 14px 16px; }
    .guest-box h4 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; }
    .guest-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 11px; }
    .table-wrap { margin-top: 16px; position: relative; }
    table { width: 100%; border-collapse: collapse; position: relative; z-index: 1; }
    thead th { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; background: #f8f4ef; border: 1px solid #d1d5db; padding: 8px; text-align: left; }
    tbody td { border: 1px solid #e5e7eb; padding: 8px; font-size: 11px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals { margin-top: 14px; display: flex; justify-content: flex-end; }
    .totals-box { width: 280px; font-size: 11px; }
    .totals-box .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb; }
    .totals-box .row:last-child { border-bottom: none; }
    .totals-box .label-muted { color: #6b7280; }
    .totals-box .discount { color: #dc2626; }
    .totals-box .grand { font-weight: 700; font-size: 13px; padding-top: 8px; border-top: 2px solid #111827; margin-top: 8px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 12px 0 6px; color: #4b5563; }
    .payment-row { display: flex; justify-content: space-between; font-size: 11px; margin-top: 6px; }
    .amount-words { margin-top: 14px; padding-left: 12px; border-left: 4px solid #f59e0b; font-size: 11px; }
    .signature { margin-top: 24px; display: flex; justify-content: flex-end; font-size: 11px; }
    .signature-box { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .signature-img { width: 160px; height: 60px; object-fit: contain; }
    .signature-box span { border-top: 1px solid #111827; padding-top: 6px; width: 160px; text-align: center; }
    .footer-area { margin-top: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .footer-text { font-weight: 600; color: #f97316; font-size: 20px; letter-spacing: 1px; }
    .footer-logos { display: flex; align-items: center; gap: 12px; }
    .footer-logo { height: 36px; object-fit: contain; }
  </style>
</head>
<body>
  <div class="page">
    <div class="top-bar"></div>
    <div class="header">
      <div class="brand">
        ${logoImg}
        <div>
          <h1>${hotel.brandName}</h1>
          <p>${hotel.tagline}</p>
        </div>
      </div>
      <div class="invoice-meta">
        <h2>INVOICE</h2>
        <p><strong>Invoice Number:</strong> ${invoice.number}</p>
        <p><strong>Invoice Date:</strong> ${invoice.date}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
      </div>
    </div>

    <div class="hotel-block">
      <div class="hotel-details">
        <h3>${hotel.name}</h3>
        <p>${hotel.address}</p>
        <p>Phone: ${hotel.phone}</p>
        <p>Email: ${hotel.email}</p>
        <p>GSTIN: ${hotel.gstin}</p>
      </div>
    </div>

    <div class="divider"></div>

    <div class="guest-box">
      <h4>Guest Details</h4>
      <div class="guest-grid">
        <div><strong>Guest Name:</strong> ${guest.name}</div>
        <div><strong>Mobile No:</strong> ${guest.phone}</div>
        <div><strong>Room No:</strong> ${stay.roomNumber}</div>
        <div><strong>Check-in Date:</strong> ${stay.checkIn}</div>
        <div><strong>No. of Nights:</strong> ${stay.nights}</div>
        <div><strong>Check-out Date:</strong> ${stay.checkOut}</div>
        <div><strong>No. of Guests:</strong> ${stay.guests}</div>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width: 8%">S. No</th>
            <th>Particulars</th>
            <th style="width: 10%" class="text-center">Qty</th>
            <th style="width: 14%" class="text-right">Rate (Rs)</th>
            <th style="width: 16%" class="text-right">Amount (Rs)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="totals-box">
        <div class="row">
          <span class="label-muted">Subtotal:</span>
          <span>${totals.subtotal}</span>
        </div>
        <div class="row">
          <span class="label-muted">Discount:</span>
          <span class="discount">-${totals.discount}</span>
        </div>
        <div class="row">
          <span class="label-muted">Taxable Amount:</span>
          <span>${totals.taxable}</span>
        </div>
        <div class="section-title">GST Breakdown</div>
        <div class="row">
          <span class="label-muted">CGST @ ${totals.cgstRate}%:</span>
          <span>${totals.cgst}</span>
        </div>
        <div class="row">
          <span class="label-muted">SGST @ ${totals.sgstRate}%:</span>
          <span>${totals.sgst}</span>
        </div>
        <div class="row">
          <span class="label-muted">Total GST:</span>
          <span>${totals.gstTotal}</span>
        </div>
        <div class="row">
          <span class="label-muted">Amount Before Round Off:</span>
          <span>${totals.beforeRound}</span>
        </div>
        <div class="row">
          <span class="label-muted">Round Off (+/-):</span>
          <span>${totals.roundOff}</span>
        </div>
        <div class="row grand">
          <span>GRAND TOTAL:</span>
          <span>${totals.grandTotal}</span>
        </div>
      </div>
    </div>

    <div class="section-title">Payment Details</div>
    <div class="payment-row">
      <span><strong>Payment Mode:</strong> ${payments.method}</span>
      <span><strong>Amount Paid:</strong> ${payments.paid}</span>
      <span><strong>Balance Due:</strong> ${payments.balance}</span>
    </div>

    <div class="amount-words">
      <strong>Amount in Words:</strong> ${amountInWords}
    </div>

    <div class="signature">
      <div class="signature-box">
        ${signatureImg}
        <span>Authorized Signatory</span>
      </div>
    </div>

    <div class="footer-area">
      <div class="footer-text">Thank you</div>
      <div class="footer-logos">
        ${footerLeftImg}
        ${footerRightImg}
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

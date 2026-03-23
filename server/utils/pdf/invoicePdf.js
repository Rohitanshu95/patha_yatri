import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import { invoicePdfTemplate } from "../templates/invoice_pdf_template.js";

const toTitle = (value) => (value ? value.toString() : "");

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN");
};

const calculateNights = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;
  const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

const getGuestCount = (guest) => {
  const total = Number(guest?.occupants?.total || 0);
  if (total > 0) return total;
  const adults = Number(guest?.occupants?.adults?.count || 0);
  const children = Number(guest?.occupants?.children || 0);
  const combined = adults + children;
  return combined > 0 ? combined : 1;
};

const numberToWords = (value) => {
  const amount = Math.floor(Number(value) || 0);
  if (amount === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const twoDigits = (num) => {
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    const tensPart = tens[Math.floor(num / 10)];
    const onesPart = ones[num % 10];
    return `${tensPart}${onesPart ? ` ${onesPart}` : ""}`.trim();
  };

  const threeDigits = (num) => {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    const hundredText = hundred ? `${ones[hundred]} Hundred` : "";
    const restText = rest ? twoDigits(rest) : "";
    return `${hundredText}${hundredText && restText ? " " : ""}${restText}`.trim();
  };

  let remaining = amount;
  const parts = [];

  const crore = Math.floor(remaining / 10000000);
  if (crore) {
    parts.push(`${threeDigits(crore)} Crore`);
    remaining %= 10000000;
  }

  const lakh = Math.floor(remaining / 100000);
  if (lakh) {
    parts.push(`${threeDigits(lakh)} Lakh`);
    remaining %= 100000;
  }

  const thousand = Math.floor(remaining / 1000);
  if (thousand) {
    parts.push(`${threeDigits(thousand)} Thousand`);
    remaining %= 1000;
  }

  if (remaining) {
    parts.push(threeDigits(remaining));
  }

  return parts.join(" ").trim();
};

const getBase64FromFile = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  const ext = path.extname(filePath).replace(".", "");
  const file = fs.readFileSync(filePath);
  return `data:image/${ext};base64,${file.toString("base64")}`;
};

const getAssetsDir = () => {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(moduleDir, "..", "..", "assets");
};

const getAssetBase64 = (assetsDir, fileName, label) => {
  const filePath = path.join(assetsDir, fileName);
  const base64 = getBase64FromFile(filePath);
  if (!base64) {
    console.warn(`⚠️ Invoice PDF asset missing: ${label} at ${filePath}`);
  }
  return base64;
};

const getFirstAssetBase64 = (assetsDir, fileNames, label) => {
  for (const fileName of fileNames) {
    const filePath = path.join(assetsDir, fileName);
    if (fs.existsSync(filePath)) {
      return getBase64FromFile(filePath);
    }
  }
  const tried = fileNames.map((name) => path.join(assetsDir, name)).join(", ");
  console.warn(`⚠️ Invoice PDF asset missing: ${label}. Tried: ${tried}`);
  return null;
};

export const generateInvoicePdf = async ({ booking, bill, room, payments = [] }) => {
  const assetsDir = getAssetsDir();
  const logoBase64 = getFirstAssetBase64(assetsDir, ["logo.jpeg", "logo.png"], "logo");
  const watermarkBase64 = getFirstAssetBase64(
    assetsDir,
    ["watermark.jpeg", "watermark.png"],
    "watermark",
  );
  const signatureBase64 = getFirstAssetBase64(
    assetsDir,
    ["sign.png", "sign.jpeg"],
    "signature",
  );
  const footerLeftBase64 = getFirstAssetBase64(
    assetsDir,
    ["footer1.jpeg", "footer1.png"],
    "footer-left",
  );
  const footerRightBase64 = getFirstAssetBase64(
    assetsDir,
    ["footre2.jpeg", "footer2.jpeg", "footer2.png"],
    "footer-right",
  );

  const guest = booking?.guest_id || {};
  const paymentMode = payments[0]?.method || "-";
  const checkOutDate = booking?.check_out_date || booking?.expected_checkout;
  const nights = calculateNights(booking?.check_in_date, checkOutDate);

  const totalAmount = Number(bill?.payable_amount) || Number(bill?.total_amount) || 0;
  const amountPaid = Number(bill?.amount_paid) || 0;
  const balanceDue = Math.max(0, totalAmount - amountPaid);

  const taxPercent = Number(room?.price?.tax_percent) || 0;
  const cgstRate = taxPercent / 2;
  const sgstRate = taxPercent / 2;

  const items = [
    {
      label: "Room Charge",
      qty: nights,
      rate: formatCurrency(room?.price?.per_night),
      amount: formatCurrency(bill?.room_charge),
    },
  ];

  (booking?.services || []).forEach((service) => {
    items.push({
      label: toTitle(service.name || service.type || "Service"),
      qty: service.quantity || 1,
      rate: formatCurrency(service.unit_price ?? service.price),
      amount: formatCurrency(service.total_price ?? (service.unit_price ?? service.price) * (service.quantity || 1)),
    });
  });

  const html = invoicePdfTemplate({
    hotel: {
      brandName: "PATHA YATRI",
      tagline: "BED AND BREAKFAST",
      name: "Patha Yatri Hotel",
      address: "Hotel Address, Bhubaneswar, Odisha",
      phone: guest?.contact || "-",
      email: guest?.email || "info@pathayatri.com",
      gstin: "GSTIN",
    },
    invoice: {
      number: bill?.invoice_number || bill?._id?.toString() || "-",
      date: formatDate(bill?.createdAt),
      dueDate: formatDate(bill?.createdAt),
    },
    guest: {
      name: guest?.name || "Guest",
      phone: guest?.contact || "-",
    },
    stay: {
      roomNumber: room?.room_number || "-",
      checkIn: formatDate(booking?.check_in_date),
      checkOut: formatDate(checkOutDate),
      nights,
      guests: getGuestCount(guest),
    },
    items,
    totals: {
      subtotal: formatCurrency((Number(bill?.room_charge) || 0) + (Number(bill?.services_charge) || 0)),
      discount: formatCurrency(bill?.discount?.amount || 0),
      taxable: formatCurrency(Math.max(0, (Number(bill?.room_charge) || 0) + (Number(bill?.services_charge) || 0) - (Number(bill?.discount?.amount) || 0))),
      cgstRate,
      sgstRate,
      cgst: formatCurrency(Number(bill?.tax_amount || 0) / 2),
      sgst: formatCurrency(Number(bill?.tax_amount || 0) / 2),
      gstTotal: formatCurrency(Number(bill?.tax_amount || 0)),
      beforeRound: formatCurrency(Number(bill?.total_amount || 0)),
      roundOff: formatCurrency(Number(bill?.roundoff_amount || 0)),
      grandTotal: formatCurrency(totalAmount),
    },
    payments: {
      method: paymentMode,
      paid: formatCurrency(amountPaid),
      balance: formatCurrency(balanceDue),
    },
    assets: {
      logoBase64,
      watermarkBase64,
      signatureBase64,
      footerLeftBase64,
      footerRightBase64,
    },
    amountInWords: `${numberToWords(totalAmount)} Only`,
  });

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return buffer;
  } finally {
    await browser.close();
  }
};

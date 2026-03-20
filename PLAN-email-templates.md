# Automated Email Templates Plan

## 1. Overview
Implement two automated email templates and integrate them with the existing `mail.js` sender.
1. **Welcome Email**: Sent at the time of room booking.
2. **Thank You & Invoice Email**: Sent at checkout when the bill is generated.

Sender Email: `itzrohit991@gmail.com`

## 2. Project Type
**BACKEND** (Node.js API)

## 3. Tech Stack
- **Node.js**: Backend environment.
- **HTML/CSS**: Inline styles for email templates to ensure consistent rendering across various mail clients (Gmail, Outlook, Apple Mail).

## 4. Success Criteria
- [ ] `booking_mail.js` exports a function that returns the structured HTML template for welcome emails.
- [ ] `invoice_receiving_mail.js` exports a function that returns the structured HTML for checkout/thank you emails.
- [ ] The email templates seamlessly accept dynamic data parameters (e.g., user name, booking ID, room details, bill amount).
- [ ] Templates visually render beautifully with correct responsive tables and inline styles.

## 5. File Structure
```text
server/
  utils/
    mail.js                     # Existing mail sending utility
    templates/
      booking_mail.js           # Target file 1
      invoice_receiving_mail.js # Target file 2
```

## 6. Task Breakdown

### Task 1: Create Welcome Email Template
- **Agent**: `backend-specialist`
- **Skill**: `frontend-design` (for HTML/CSS inside the email)
- **Priority**: P1
- **Dependencies**: None
- **INPUT**: Guest Name, Room Details, Check-in/Check-out dates, Booking Reference.
- **OUTPUT**: `server/utils/templates/booking_mail.js` containing an HTML template string generator.
- **VERIFY**: The exported function interpolates inputs into robust inline-styled HTML without any styling breaks.

### Task 2: Create Thank You & Invoice Template
- **Agent**: `backend-specialist`
- **Skill**: `frontend-design` 
- **Priority**: P1
- **Dependencies**: None
- **INPUT**: Guest Name, Total Bill Amount, Breakdown of charges, Checkout Date.
- **OUTPUT**: `server/utils/templates/invoice_receiving_mail.js` containing the billing HTML template.
- **VERIFY**: The exported function accepts billing details and outputs a visually appealing, professional email markup featuring a clean HTML table for the invoice snippet.

## 7. Phase X: Verification
- [ ] Code follows `[skills/clean-code]` guidelines (pure functions, no side effects).
- [ ] Both template files are successfully imported and tested in `mail.js`.
- [ ] Test the integration locally to ensure emails actually deliver to a test inbox via `itzrohit991@gmail.com` without getting blocked by Google.

## ✅ PHASE X COMPLETE
*(Pending execution of tasks)*

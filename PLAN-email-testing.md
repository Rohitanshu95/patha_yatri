# Email Setup and Testing Plan

## 1. Overview
A step-by-step guide to configure the `itzrohit991@gmail.com` Gmail account for SMTP sending, and how to rigorously test both the Welcome and Checkout email pipelines.

## 2. Project Type
**BACKEND**

## 3. Success Criteria
- Gmail is configured to allow `nodemailer` to send emails via an App Password.
- `.env` file successfully loads `SMTP_PASS`.
- Booking a room successfully delivers the "Welcome" email to the provided guest email.
- Checking out successfully delivers the "Invoice" email.

## 4. Task Breakdown

### Task 1: Generate Google App Password
- **Agent**: `project-planner`
- **Action**: 
  1. Open your Google Account for `itzrohit991@gmail.com`.
  2. Navigate to **Security** -> **2-Step Verification** -> **App Passwords**.
  3. Create an App password named "Patha Yatri Mailer".
  4. Copy the 16-digit password generated.

### Task 2: Configure Environment Variables
- **Agent**: `backend-specialist`
- **Action**: Open `server/.env` and update the following variables:
  ```env
  SMTP_USER="itzrohit991@gmail.com"
  SMTP_PASS="paste_the_16_digit_password_here"
  ```
- **Action**: Restart your backend server (`npm run dev`) to ensure it reads the new `.env` values.

### Task 3: Test Booking Flow (Welcome Mail)
- **Agent**: `test-engineer`
- **Action**: 
  1. Log into your Receptionist Dashboard.
  2. Create a dummy Guest profile using **your own email address** (so you can view the received email).
  3. Book an available room for this guest.
  4. Check the backend terminal for the `✅ Booking email sent:` success log.
  5. Check your email inbox (and spam folder) for the beautifully styled Booking Confirmation HTML.

### Task 4: Test Checkout Flow (Invoice Mail)
- **Agent**: `test-engineer`
- **Action**: 
  1. Go to the active dashboard.
  2. Mark the dummy booking as "Checked-In".
  3. Initiate a "Check-Out" and settle the bill.
  4. Check the backend terminal for the `✅ Invoice email sent:` success log.
  5. Check your email inbox for the Thank You & Invoice HTML email.

## 5. Phase X: Verification
- [ ] Environment variables configured correctly.
- [ ] No authentication errors in terminal logs from `nodemailer`.
- [ ] Both interactive HTML emails visually render perfectly in a Gmail client without breaking.

## ✅ PHASE X COMPLETE
*(Pending execution of tasks by user)*

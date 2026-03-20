# Patha Yatri — Hotel Management System: Implementation Plan

## Project Summary

**Stack:** Node.js 20 + Express 5 + MongoDB/Mongoose · React 19 + Vite + Tailwind v4 + Zustand  
**Goal:** Complete the hotel billing system from current scaffold state to a fully functional application (excluding Razorpay — deferred for a future phase).

---

## Current State Assessment

| Area | Status | Notes |
|------|--------|-------|
| **DB Models** | ✅ Complete | All 7 models (User, Room, Guest, Booking, Service, Bill, Payment) match spec |
| **Route Scaffolds** | ⚠️ Stubs only | All routes exist but return placeholder `res.json({ msg: "..." })` |
| **Auth Middleware** | ✅ Working | [authenticate](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/middleware/auth.js#3-18) + [authorize](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/middleware/auth.js#19-27) in place |
| **server entry** | ❌ Broken | [server.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/server.js) uses CJS `require()` while [index.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/index.js) uses ESM `import`. DB never connects. |
| **config/db.js** | ❌ CJS | Uses `module.exports` / `require` while package is `"type": "module"` |
| **Auth routes** | ❌ No logic | Login handler has a comment stub, never issues JWT |
| **Frontend routing** | ⚠️ Partial | [App.jsx](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/App.jsx) missing `Routes` import; `Dashboard`, `Booking` undefined |
| **Auth Store** | ❌ Empty | [login()](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#9-10) and [logout()](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#10-11) are async no-ops |
| **Axios baseURL** | ❌ Wrong | Configured as `/api` but server uses `/api/v1` |

> [!CAUTION]
> The server **will not start** due to the CJS/ESM mismatch. Phase 0 must be fixed before any backend work.

---

## User Review Required

> [!IMPORTANT]
> **Razorpay Deferred:** Online payment gateway integration is explicitly excluded from this plan. The `POST /payments/online/create-order` and `POST /payments/online/verify` route stubs will be left as placeholders (returning 501 Not Implemented). Cash, Card, and UPI payments are fully implemented.

> [!NOTE]
> **File Storage:** The plan uses Cloudinary for both room images and guest ID proof uploads. If you prefer AWS S3, let me know before Phase 2 begins. The Multer + Cloudinary pattern is identical to S3 except credentials.

> [!NOTE]
> **Email/SMS:** Nodemailer (invoice email on checkout) and Twilio (SMS notification) are included in Phase 4/5 respectively. These require active credentials in [.env](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/.env). They can be toggled off with a feature flag if credentials are unavailable.

---

## Proposed Changes

### Phase 0 — Critical Bug Fixes

#### [MODIFY] [server/config/db.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/config/db.js)
Convert from CJS to ESM. Add `export default connectDB`.

#### [MODIFY] [server/server.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/server.js)
Remove this file — its role is absorbed into [index.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/index.js) (ESM entry point).

#### [MODIFY] [server/index.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/index.js)
Add [connectDB()](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/config/db.js#3-12) call before `server.listen()`.

#### [MODIFY] [client/src/config/axios.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/config/axios.js)
Change `baseURL` from `http://localhost:5000/api` → `http://localhost:5000/api/v1`.

#### [MODIFY] [client/src/App.jsx](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/App.jsx)
Add `Routes` import. Fix undefined `Dashboard` and `Booking` references. Correct nested paths.

---

### Phase 1 — Backend: Auth & User Module

#### [NEW] server/controllers/auth.controller.js
Implements: [login](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#9-10) (bcrypt compare → JWT sign → cookie), [logout](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#10-11) (clear cookie), `me` (fetch user from DB).

#### [NEW] server/controllers/user.controller.js
Implements: `listUsers`, `createUser`, `updateUser`, `deactivateUser` (admin only).

#### [NEW] server/routes/user.routes.js
New route file for `/api/v1/users` (admin CRUD). Register in [index.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/index.js).

#### [MODIFY] server/routes/auth.routes.js
Wire existing stubs to controller functions.

#### [NEW] server/middleware/validate.js
Generic Zod validation middleware: `validate(schema)` wrapper for request body/query.

#### [NEW] server/validators/auth.validator.js
Zod schemas: `loginSchema`, `createUserSchema`, `updateUserSchema`.

#### [NEW] server/middleware/rateLimiter.js
`express-rate-limit` config for auth routes (5 req / 15 min per IP).

#### [NEW] server/scripts/seed.js
Seed 3 users: Admin, Manager, Receptionist with hashed passwords.

#### [MODIFY] client/src/store/authStore.js
Implement [login(formData)](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#9-10), [logout()](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#10-11), `fetchMe()`, Zustand persist for `user` + `isAuthenticated`.

#### [MODIFY] client/src/pages/Auth/Login.jsx
Full login page UI: hotel logo, email/password fields, validation, error toast, redirect on success.

---

### Phase 2 — Backend: Room & Guest Module

#### [NEW] server/controllers/room.controller.js
Implements: `createRoom`, `listRooms` (with filter), `getRoom`, `updateRoom`, `changeRoomStatus`, `getAvailableRooms`.

#### [MODIFY] server/routes/room.routes.js
Wire stubs to room controller functions.

#### [NEW] server/middleware/upload.js
Multer `memoryStorage` + Cloudinary stream upload utility (used for room images and ID proof).

#### [NEW] server/controllers/guest.controller.js
Implements: `registerGuest` (with document upload), `listGuests` (search), `getGuest`, `updateGuest`.

#### [MODIFY] server/routes/guest.routes.js
Wire stubs to guest controller functions.

#### [NEW] server/validators/room.validator.js
Zod schemas for room creation/update.

#### [NEW] server/validators/guest.validator.js
Zod schemas for guest registration/update.

---

### Phase 3 — Backend: Booking Management

#### [NEW] server/utils/billCalculator.js
Pure utility: `calculateBill({ roomPricePerNight, nights, services, taxPercent, discount })`.
Handles GST slabs (0% / 12% / 18%), discount deduction, total computation.

#### [NEW] server/utils/invoiceNumber.js
Auto-generates unique sequential invoice numbers (e.g., `PY-2026-0001`).

#### [NEW] server/controllers/booking.controller.js
Implements:
- `createBooking`: create Guest + Booking + empty Bill (linked together)
- `checkIn`: set room → `occupied`, set booking → `checked-in`
- `checkOut`: recalculate final bill, set room → `available`, set booking → `checked-out`, trigger invoice email
- `cancelBooking`: Manager+ only, set booking → `cancelled`, room → `available`
- `addService`: create Service doc, recalculate Bill in-place
- `removeService`: Manager+ only, remove Service, recalculate Bill

#### [MODIFY] server/routes/booking.routes.js
Wire all stubs to controller functions.

#### [NEW] server/validators/booking.validator.js
Zod schemas for booking creation, service addition.

---

### Phase 4 — Backend: Billing, Payments & Invoice

#### [NEW] server/controllers/bill.controller.js
Implements: `getBill` (with services populated), `applyDiscount`.

#### [MODIFY] server/routes/bill.routes.js
Wire stubs. Add `GET /:id/invoice` → stream PDF response.

#### [NEW] server/controllers/payment.controller.js
Implements:
- `recordPayment`: create Payment doc, update `bill.amount_paid`, compute `remaining_amount`, update `bill.status` (paid / partial / unpaid)
- `refundPayment`: update Payment status → `refunded`, update bill accordingly
- `createRazorpayOrder`: return 501 Not Implemented (deferred)
- `verifyRazorpay`: return 501 Not Implemented (deferred)

#### [MODIFY] server/routes/payment.routes.js
Wire stubs to controller functions.

#### [NEW] server/utils/pdfGenerator.js
PDFKit-based invoice PDF generator. Produces GST-compliant invoice with: hotel header, GSTIN, invoice number, guest details, room/service lines, tax breakup (CGST + SGST), total paid/remaining. Returns a `Buffer`.

#### [NEW] server/utils/mailer.js
Nodemailer config + `sendInvoiceEmail(guest, pdfBuffer)` utility.

---

### Phase 5 — Backend: Reports, Audit & SMS

#### [NEW] server/models/AuditLog.js
Schema: `{ action, entity, entityId, performedBy, details, createdAt }`.

#### [NEW] server/middleware/auditLogger.js
Middleware factory: `logAction(action, entity)` — logs to `audit_logs` collection after each critical operation.

#### [NEW] server/controllers/report.controller.js
Implements aggregation pipelines for: `getRevenueReport`, `getOccupancyReport`, `getGSTReport`, `getAuditLog`.

#### [MODIFY] server/routes/report.routes.js
Wire stubs to report controller.

#### [NEW] server/utils/sms.js
Twilio SMS utility: `sendBookingConfirmation(contact, details)`, `sendCheckoutReminder(contact, details)`.

---

### Phase 6 — Frontend: Core Layout & Auth

#### [MODIFY] client/src/App.jsx
Full fix: correct imports, fix path nesting (`/app/admin/...`, `/app/manager/...`, etc.), add all page routes.

#### [MODIFY] client/src/pages/Layout/AppLayout.jsx
Shell layout: `<Sidebar>` + `<Header>` + `<Outlet>`.

#### [MODIFY] client/src/components/SideBar/SideBar.jsx
Role-based nav links with icons (Lucide), active highlight, collapse state.

#### [MODIFY] client/src/components/Header/Header.jsx
User avatar, role badge, hotel name, logout button.

#### [MODIFY] client/src/store/authStore.js
Fully implement [login](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#9-10), [logout](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#10-11), `fetchMe`, local persist via `zustand/middleware`.

#### [NEW] client/src/pages/Auth/Login.jsx (overwrite)
Premium hotel login UI with dark theme, brand logo slot, animated form.

#### [MODIFY] client/src/pages/UserManagement/UserManagement.jsx
Admin-only: staff list table, add user modal, role/status management.

---

### Phase 7 — Frontend: Room & Guest Management

#### [NEW] client/src/store/roomStore.js
Zustand store: rooms list, filters (category, availability), CRUD actions.

#### [NEW] client/src/pages/Rooms/RoomsPage.jsx
Room grid/table with filters, availability badges, add/edit modal, image preview.

#### [NEW] client/src/pages/Rooms/RoomAvailabilityCalendar.jsx
Calendar component showing room occupancy over time.

#### [NEW] client/src/store/guestStore.js
Zustand store: guest search, register, update actions.

#### [NEW] client/src/pages/Guests/GuestRegistration.jsx
Multi-step form: personal info → occupants → document upload (ID proof image).

#### [NEW] client/src/pages/Guests/GuestSearch.jsx
Search by name/contact, guest card with booking history.

---

### Phase 8 — Frontend: Booking Management

#### [NEW] client/src/store/bookingStore.js
Zustand store: booking list, active booking, service list, status transitions.

#### [NEW] client/src/pages/Bookings/BookingTable.jsx
Filterable table: status badge, date, room, guest, action buttons.

#### [NEW] client/src/pages/Bookings/NewBookingForm.jsx
Room selector (availability check), guest search/create, expected checkout, advance payment.

#### [MODIFY] client/src/pages/Booking/Booking.jsx
Full booking management hub: tabs for New / Active / History.

#### [NEW] client/src/pages/Bookings/CheckInModal.jsx
Confirmation modal: guest summary, room, payment collected.

#### [NEW] client/src/pages/Bookings/CheckOutFlow.jsx
Step-by-step: bill summary → payment collection → invoice download.

#### [NEW] client/src/pages/Bookings/RunningBillPanel.jsx
Live bill panel during stay: room charge, services list, real-time total.

#### [NEW] client/src/pages/Bookings/AddServiceModal.jsx
Quick-add food/laundry/spa/other with qty × price calculation.

---

### Phase 9 — Frontend: Billing & Reports

#### [NEW] client/src/pages/Billing/BillView.jsx
Bill breakdown: room charge, services, GST (CGST+SGST), discount, total, paid, remaining.

#### [NEW] client/src/pages/Billing/ApplyDiscountModal.jsx
Manager-only modal: select type (seasonal / loyalty / corporate / manual) + amount.

#### [NEW] client/src/pages/Billing/PaymentHistory.jsx
Timeline of payment transactions per booking.

#### [NEW] client/src/pages/Dashboard/Dashboard.jsx (overwrite)
Role-aware dashboard: revenue chart (Recharts), occupancy ring, today's check-in/out counts.

#### [NEW] client/src/pages/Reports/ReportsPage.jsx
Date-range picker, revenue/occupancy/GST tabs, data table, export-to-CSV button.

---

### Phase 10 — Security, Performance & Testing

#### [NEW] server/middleware/rateLimiter.js
`express-rate-limit` with custom 429 response.

#### [MODIFY] server/index.js
Add `morgan`, `express-mongo-sanitize`, finalized helmet config.

#### [NEW] tests/unit/billCalculator.test.js
Jest unit tests: all GST slabs, discount combinations, hourly rate edge case.

#### [NEW] tests/unit/authController.test.js
Jest unit tests: login success, wrong password, inactive user.

#### [NEW] tests/integration/booking.test.js
Supertest: full lifecycle — create → check-in → add service → checkout → pay.

---

### Phase 11 — DevOps & Documentation

#### [NEW] server/.env.example
All required env variables with placeholder values.

#### [NEW] client/.env.example
`VITE_API_URL` + any other client-side env vars.

#### [NEW] docker-compose.yml
Services: `api` (Node), `client` (served by Nginx), optional `mongo` for local dev.

#### [NEW] .github/workflows/ci.yml
On push to `main`: lint → test → build Docker image.

#### [NEW] docs/openapi.yaml
Swagger/OpenAPI 3.0 spec for all `/api/v1` endpoints.

---

## Verification Plan

### Phase 0 — Bug Fixes
- **Command:** `cd server && node index.js`
- **Expected:** Server starts, logs `✅ MongoDB Connected` and `🚀 Server running on port 5000`
- No errors about `require is not defined`

### Phase 1 — Auth
- **Command:** `cd server && npm run dev` then:
  ```
  POST http://localhost:5000/api/v1/auth/login
  Body: { "email": "admin@hotel.com", "password": "Admin@1234" }
  ```
- **Expected:** 200 OK with `{ user: {...} }`, cookie `token` set in response
- **Seed first:** `node server/scripts/seed.js`

### Phase 2–5 — Backend Modules
- **Unit tests:** `cd server && npx jest tests/unit/` (Jest + Supertest)
- **Integration tests:** `cd server && npx jest tests/integration/`
- **Manual API test:** Use Postman or Thunder Client with the full booking lifecycle

### Phase 6–9 — Frontend
- **Command:** `cd client && npm run dev`
- **Manual flow:** Open `http://localhost:5173`, log in as receptionist, create a booking, add a service, check out, download invoice
- **Browser tool** will be used to verify pages render and interact correctly

### Phase 10 — Security
- **Lint:** `cd client && npm run lint`
- **Rate limit test:** Send 6 rapid login requests → 6th should return 429

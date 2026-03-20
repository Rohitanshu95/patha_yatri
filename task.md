# Patha Yatri — Hotel Management System: Task Tracker

## 🔧 Phase 0: Critical Bug Fixes (Pre-requisite)
- [ ] Fix module system mismatch: [server.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/server.js) uses CJS (`require`), [index.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/index.js) uses ESM (`import`). Consolidate to ESM + fix [config/db.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/config/db.js) to use ESM export
- [ ] Fix [config/db.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/config/db.js) — currently CJS `require`/`module.exports`; convert to ESM
- [ ] Fix [server.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/server.js) — remove CJS entry, make [index.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/server/index.js) the sole entry point and connect DB there
- [ ] Fix axios `baseURL` in [client/src/config/axios.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/config/axios.js) — update to `/api/v1` (currently `/api`)
- [ ] Fix [App.jsx](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/App.jsx) — missing `<Routes>` import and undefined `Dashboard`, `Booking` components

---

## 🏗️ Phase 1: Backend — Auth & User Module
- [ ] Implement `/api/v1/auth/login`: bcrypt compare, JWT sign, set httpOnly cookie
- [ ] Implement `/api/v1/auth/logout`: clear cookie
- [ ] Implement `/api/v1/auth/me`: return req.user from DB
- [ ] Add `morgan` for HTTP logging (missing from index.js)
- [ ] Add rate limiter middleware on `/auth/login` (max 5/15min)
- [ ] Add validation middleware (Zod schemas) for auth endpoints
- [ ] Create user seeder script (seed Admin, Manager, Receptionist)
- [ ] Implement User CRUD API (`GET /users`, `POST /users`, `PUT /users/:id` — admin only)
- [ ] Complete [authStore.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js): implement [login()](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#9-10), [logout()](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#10-11), `fetchMe()` actions
- [ ] Build Login page (`Auth/Login.jsx`) with form + API call + error handling

---

## 🏠 Phase 2: Backend — Room & Guest Module
- [ ] Implement Room CRUD controllers: `createRoom`, `listRooms`, `getRoom`, `updateRoom`
- [ ] Implement `changeRoomStatus` controller (available/occupied/maintenance)
- [ ] Implement `getAvailableRooms` with date-range query logic
- [ ] Setup Cloudinary/Multer for room image upload
- [ ] Implement Guest CRUD controllers: `registerGuest`, `listGuests`, `getGuest`, `updateGuest`
- [ ] Setup Multer + Cloudinary for ID proof document upload
- [ ] Add Zod validation schemas for Room and Guest
- [ ] Write unit tests for Room and Guest controllers

---

## 📅 Phase 3: Backend — Booking & Stay Management
- [ ] Implement `createBooking` controller (walk-in + reservation, creates Bill stub)
- [ ] Implement booking status machine: `booked → checked-in → checked-out | cancelled`
- [ ] Implement `checkIn` controller: assign room → occupied, create empty Bill document
- [ ] Implement `checkOut` controller: finalize bill, update room → available, trigger invoice
- [ ] Implement `addService` controller: create Service doc, recalculate Bill
- [ ] Implement `removeService` controller
- [ ] Implement `cancelBooking` controller (manager+)
- [ ] Add late checkout / early checkin surcharge logic
- [ ] Write integration tests for full booking lifecycle

---

## 💰 Phase 4: Backend — Billing, Payments & Invoice
- [ ] Implement bill auto-calculation utility: [(room × nights + services) × GST − discount](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/App.jsx#9-47)
- [ ] Implement GST slab logic (0% / 12% / 18%) based on per-night price
- [ ] Build discount engine (seasonal, loyalty, corporate, manual types)
- [ ] Implement `recordPayment` controller (cash/card/UPI)
- [ ] Implement partial payment tracking and balance update
- [ ] Implement refund controller with status transition
- [ ] Generate PDF invoices using PDFKit
- [ ] Integrate Nodemailer to email invoice PDF on checkout
- [ ] Add `invoice_number` auto-generation utility (sequential, unique)
- [ ] Write tests for bill calculation edge cases

---

## 📊 Phase 5: Backend — Reports, Audit & Notifications
- [ ] Implement `getRevenueReport` (daily/weekly/monthly aggregation pipeline)
- [ ] Implement `getOccupancyReport` (room-wise, category-wise)
- [ ] Implement `getGSTReport` (period-based aggregation)
- [ ] Create `audit_logs` collection + log all critical operations
- [ ] Implement `getAuditLog` endpoint (admin only)
- [ ] Setup Twilio SMS for booking confirmation and checkout reminders

---

## 🖥️ Phase 6: Frontend — Core Layout & Auth
- [ ] Fix [App.jsx](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/App.jsx): add missing `Routes` import, fix path structure (`/app/admin`, `/app/manager`, `/app/receptionist`)
- [ ] Complete [AppLayout.jsx](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/pages/Layout/AppLayout.jsx) — sidebar + header shell
- [ ] Complete [SideBar.jsx](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/components/SideBar/SideBar.jsx) — role-based navigation links, active state, collapse toggle
- [ ] Complete [Header.jsx](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/components/Header/Header.jsx) — user avatar, role badge, logout button
- [ ] Build [Home.jsx](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/pages/Home/Home.jsx) — landing/redirect page (redirect to login if not auth'd)
- [ ] Complete [authStore.js](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js) — [login](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#9-10), [logout](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/store/authStore.js#10-11), `fetchMe`, persist with zustand/persist
- [ ] Build Login page UI — hotel branding, email/password form, toast errors
- [ ] Build Admin [UserManagement.jsx](file:///d:/Documents/Manash/work/E-Square/PROJECTS/04.%20Patha%20Yatri/client/src/pages/Admin/AdminUserManagement.jsx) — CRUD table for hotel staff accounts

---

## 🏨 Phase 7: Frontend — Room & Guest Management
- [ ] Create Zustand `roomStore.js` — room list, filters, CRUD actions
- [ ] Build Rooms list page — table with category/status filters, add/edit modals
- [ ] Build Room detail page — show amenities, current booking, images
- [ ] Build Room availability calendar component
- [ ] Create Zustand `guestStore.js` — guest search, register, update
- [ ] Build Guest registration UI — multi-step form with ID proof file upload
- [ ] Build Guest search page — search by name/contact, view history

---

## 📋 Phase 8: Frontend — Booking Management
- [ ] Create Zustand `bookingStore.js` — booking list, status, CRUD actions
- [ ] Build Booking table page — search, filter by status/date/room, status badges
- [ ] Build New Booking form — select available room, create/search guest, advance collection
- [ ] Build Check-in confirmation modal
- [ ] Build Check-out flow — summary view, payment collection, invoice download
- [ ] Build live Running Bill panel during guest stay
- [ ] Build Add Service modal (food/laundry/spa) with real-time bill update

---

## 📈 Phase 9: Frontend — Billing & Reports
- [ ] Build Bill view page — room/service/tax/discount breakdown
- [ ] Build Apply Discount modal (manager only)
- [ ] Build Payment History UI per booking
- [ ] Build Dashboard UI — revenue chart, occupancy rate, today's check-ins/outs
- [ ] Build Reports page — revenue/occupancy/GST with date range picker + CSV export

---

## 🔒 Phase 10: Security, Performance & Testing
- [ ] Add `express-rate-limit` on auth routes
- [ ] Add `morgan` HTTP logger
- [ ] Add MongoDB compound indexes for performance
- [ ] Use Mongoose `.lean()` queries in list endpoints
- [ ] Input sanitization (`express-mongo-sanitize`)
- [ ] Review helmet headers configuration
- [ ] Write E2E tests with Playwright (receptionist walk-in flow, bill PDF download, manager discount)
- [ ] Setup Jest + Supertest configuration

---

## 🚀 Phase 11: DevOps & Delivery
- [ ] Create `.env.example` files for server and client
- [ ] Setup Docker + docker-compose
- [ ] Setup GitHub Actions CI/CD
- [ ] Write Swagger/OpenAPI API documentation

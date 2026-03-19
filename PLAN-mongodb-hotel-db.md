# PLAN: Hotel Management System (MongoDB - 6 Tables)

## Overview
Implementation of the Hotel Management System utilizing MongoDB (Mongoose), strictly following the **6-Collection Architecture** requested by the user. This architecture separates concerns perfectly for a SaaS or Single-Hotel system, using Mongoose references (`ObjectId`) to link data while leveraging embedded arrays only for timeline-specific snapshots (like running bills).

## Project Type
**BACKEND**

## Success Criteria
- [ ] Strict Mongoose schemas for exactly 6 collections: `Users`, `Rooms`, `Bookings`, `Services`, `Guests`, `Bill-Payments`.
- [ ] `Bookings` acts as the central junction, referencing Rooms and Guests.
- [ ] `Bill-Payments` tracks actual monetary exchanges and outstanding balances.
- [ ] Running bill items (consumed services) are tracked without losing relational integrity.

## Tech Stack
- **Database**: MongoDB (Atlas or Local)
- **ODM**: Mongoose
- **Backend Framework**: Node.js / Express (Assumed)

## File Structure
```
├── src/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js          (Staff/Admins)
│   │   ├── Guest.js         (Customers)
│   │   ├── Room.js          (Inventory)
│   │   ├── Service.js       (Catalog)
│   │   ├── Booking.js       (Reservations & Running Array)
│   │   └── BillPayment.js   (Monetary Ledgers/Invoices)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── ... etc
│   └── routes/
```

## Task Breakdown

### TASK-01: Initialize Staff & Inventory Schemas
- **Agent**: `backend-specialist`
- **Skills**: `database-design`
- **Priority**: P0
- **Dependencies**: None
- **INPUT**: 6-table requirement
- **OUTPUT**: `src/models/User.js`, `src/models/Room.js`, `src/models/Service.js`
- **VERIFY**: Schemas validate. Users have roles (admin, staff). Rooms have status/pricing.

### TASK-02: Create Guest Schema
- **Agent**: `backend-specialist`
- **Skills**: `database-design`
- **Priority**: P0
- **Dependencies**: None
- **INPUT**: `e.js` guest fields
- **OUTPUT**: `src/models/Guest.js`
- **VERIFY**: Guest separates personal info, ID documents, and contact details from the booking timeline.

### TASK-03: Implement Central Booking Schema
- **Agent**: `backend-specialist`
- **Skills**: `database-design`
- **Priority**: P1
- **Dependencies**: TASK-01, TASK-02
- **INPUT**: Need to reference Guest, Room, User.
- **OUTPUT**: `src/models/Booking.js`
- **VERIFY**: Schema uses `mongoose.Schema.Types.ObjectId` for `guest_id`, `room_id`, and `created_by`. Includes an embedded array for `consumed_services` (referencing `Service` and locking the snapshot price).

### TASK-04: Implement Bill-Payments Schema (Ledger)
- **Agent**: `backend-specialist`
- **Skills**: `database-design`, `api-patterns`
- **Priority**: P1
- **Dependencies**: TASK-03
- **INPUT**: Financial tracking requirement
- **OUTPUT**: `src/models/BillPayment.js`
- **VERIFY**: Schema tracks payment method, amount, `booking_id`, and status (success/failed). Can handle partial advance payments.

### TASK-05: Integrate Booking & Payment API State
- **Agent**: `backend-specialist`
- **Skills**: `nodejs-best-practices`
- **Priority**: P2
- **Dependencies**: TASK-04
- **INPUT**: API routes for checkout
- **OUTPUT**: `checkoutController.js` logic
- **VERIFY**: When a Booking is checking out, it sums the room cost + `consumed_services`, subtracts the sum of `BillPayments`, and demands the remaining amount.

## Phase X: Verification (Mandatory)
- [ ] Schema Validation checks (`mongoose` strict mode).
- [ ] `ObjectId` references are correct and indexing is applied to `booking_id` and `guest_id`.
- [ ] Running a full booking test: Create Guest -> Create Booking -> Add Service -> Make Payment -> Checkout.

# Hotel Location Management

This plan coordinates the addition of location management for hotels and assigning managers to specific locations.

## Overview
Based on user requirements, when an admin adds a new hotel, they will directly upload the hotel's photo and input the location details for that specific hotel. A manager will manage exactly that one hotel (location-wise), without needing a complex multi-node architecture.

## Architecture Decisions
- **Flat Hotel Schema**: The `Hotel` database model will natively contain the `location` text details and `photo` URL, meaning no separate "Locations" database table or admin tab is required.
- **Manager Assignment**: A Manager user account is assigned to a specific `hotelId`. They only control operations within that physical site.

## Project Type
WEB (MERN Stack: React/Vite, Express, Mongoose)

## Success Criteria
- [ ] Admin can view the "Hotels" menu inside the Admin dashboard.
- [ ] Admin can click "Add New Hotel" to display a form for: Name, Location Details, and Hotel Photo Upload.
- [ ] A Manager account can be linked to exactly one Hotel.
- [ ] Role-based access ensures Managers only see/edit data (billing/guests) for their assigned Hotel.

## Tech Stack
- Frontend: React / Tailwind CSS
- Backend: Node.js / Express (Multer/Cloudinary for photo uploads indicated by `package.json`)
- DB: MongoDB / Mongoose

## Task Breakdown

### Phase 1: Database & Backend Implementation
- **Agent**: `backend-specialist`
- **Task**: Modify `Hotel` Mongoose schema to include `locationDetails` (String) and `photoUrl` (String). Update the manager `User` schema to hold a `hotelId` reference.
- **Verify**: Model compilation succeeds without errors.

### Phase 2: API Routes
- **Agent**: `backend-specialist`
- **Task**: Create/update POST, PUT, GET routes for `/api/hotels`. Ensure the POST route handles image upload (e.g., via Cloudinary and Multer) and saves location details. Ensure data fetching for managers is restricted to `req.user.hotelId`.
- **Verify**: Postman/curl requests succeed.

### Phase 3: Admin Frontend (Add Hotel)
- **Agent**: `frontend-specialist`
- **Task**: Build "Add Hotel" form. Fields: Hotel Name, Photo File Upload, Location Description text area. Submit via Axios/fetch. Add a grid/table to view existing hotels with photos.
- **Verify**: Form submits correctly to the API and new hotel displays in the list.

### Phase 4: Manager Access Control
- **Agent**: `security-auditor` / `backend-specialist`
- **Task**: Enforce manager scope across the entire app so a manager cannot see the admin dashboard or other hotels' data.
- **Verify**: Login as manager → attempt to view other hotels → Permission Denied.

## Final Verification (Phase X)
- [ ] Socratic Gate was respected
- [ ] Security checks pass (`python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`)
- [ ] Build succeeds (`npm run build`)
- [ ] No regression on current Admin pages.

import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Guest from "../models/Guest.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import Bill from "../models/Bill.js";
import Payment from "../models/Payment.js";
import Service from "../models/Service.js";
import AuditLog from "../models/AuditLog.js";
import { calculateBill } from "../utils/billCalculator.js";
import User from "../models/User.js";

dotenv.config();

const SEED_DAYS = Number(process.env.SEED_DAYS) || 14;
const SEED_BOOKINGS = Number(process.env.SEED_BOOKINGS) || 30;
const SEED_RESET = true;
const RNG_SEED = Number(process.env.SEED_RANDOM_SEED) || 12345;

const createRng = (seed) => {
	let state = seed >>> 0;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
};

const rng = createRng(RNG_SEED);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
const randFloat = (min, max) => rng() * (max - min) + min;

const shuffle = (arr) => {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(rng() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
};

const buildGuestPayload = (index) => {
	const firstNames = ["Asha", "Ravi", "Neha", "Arjun", "Pooja", "Sameer", "Anita", "Sonal", "Kunal", "Ritika"];
	const lastNames = ["Das", "Sharma", "Verma", "Gupta", "Roy", "Singh", "Jain", "Basu", "Mehta", "Nair"];
	const name = `${pick(firstNames)} ${pick(lastNames)}`;
	const contact = `98${randInt(10000000, 99999999)}`;
	const occupantsAdults = randInt(1, 3);
	const occupantsChildren = rng() > 0.7 ? randInt(1, 2) : 0;

	return {
		name,
		contact,
		email: `guest${index}@hotel.com`,
		address: pick(["Kolkata", "Delhi", "Mumbai", "Bhubaneswar", "Chennai", "Bengaluru"]),
		occupants: {
			total: occupantsAdults + occupantsChildren,
			adults: {
				count: occupantsAdults,
				male: Math.max(1, randInt(1, occupantsAdults)),
				female: Math.max(0, occupantsAdults - 1),
			},
			children: occupantsChildren,
		},
		verification_status: rng() > 0.3 ? "verified" : "pending",
	};
};

const buildServicePayload = (bookingId, addedBy, servedAt) => {
	const type = pick(["fooding", "laundry", "spa", "other"]);
	const serviceMap = {
		fooding: { name: "In-room Dining", unitMin: 250, unitMax: 600 },
		laundry: { name: "Laundry", unitMin: 100, unitMax: 250 },
		spa: { name: "Spa Session", unitMin: 1200, unitMax: 2500 },
		other: { name: "Airport Pickup", unitMin: 700, unitMax: 1200 },
	};
	const config = serviceMap[type];
	const quantity = randInt(1, type === "spa" ? 1 : 3);
	const unit_price = Math.round(randFloat(config.unitMin, config.unitMax));
	const total_price = unit_price * quantity;

	return {
		booking_id: bookingId,
		type,
		name: config.name,
		quantity,
		unit_price,
		total_price,
		description: rng() > 0.6 ? "Premium add-on" : "Standard",
		served_at: servedAt,
		added_by: addedBy,
	};
};

const buildPayments = ({ billId, bookingId, amountPaid, collectedBy, paidAt }) => {
	if (amountPaid <= 0) return [];
	const paymentCount = amountPaid > 3000 && rng() > 0.6 ? 2 : 1;
	const methods = ["cash", "card", "UPI", "online_gateway"];
	const chunks = [];
	if (paymentCount === 1) {
		chunks.push(amountPaid);
	} else {
		const first = Math.max(500, Math.round(amountPaid * randFloat(0.4, 0.7)));
		chunks.push(first, Math.max(0, amountPaid - first));
	}

	return chunks.map((amount, idx) => ({
		bill_id: billId,
		booking_id: bookingId,
		method: pick(methods),
		amount,
		transaction_id: `TXN-${billId.toString().slice(-4)}-${idx + 1}`,
		payment_date: paidAt,
		status: "success",
		collected_by: collectedBy,
		notes: rng() > 0.7 ? "Front desk" : "",
	}));
};

const logAudit = async (entry) => {
	try {
		const log = new AuditLog(entry);
		await log.save();
	} catch (error) {
		console.error("Audit log error:", error.message);
	}
};

const buildInvoiceNumber = (year, sequence) => {
	const paddedSequence = sequence.toString().padStart(4, "0");
	return `PY-${year}-${paddedSequence}`;
};

const getStartingInvoiceSequence = async () => {
	const year = new Date().getFullYear();
	const lastBill = await Bill.findOne().sort({ createdAt: -1 });
	let sequence = 1;

	if (lastBill?.invoice_number) {
		const parts = lastBill.invoice_number.split("-");
		if (parts.length === 3 && parts[1] === year.toString()) {
			const parsed = parseInt(parts[2], 10);
			if (Number.isFinite(parsed)) {
				sequence = parsed + 1;
			}
		}
	}

	return { year, sequence };
};

const seed = async () => {
	try {
		await connectDB();

		const users = await User.find();
		const admin = users.find((user) => user.role === "admin");
		const receptionist = users.find((user) => user.role === "receptionist");
		const manager = users.find((user) => user.role === "manager");

		if (!admin || !receptionist || !manager) {
			throw new Error("Seed users missing. Run server/scripts/seed.js first.");
		}

		const rooms = await Room.find();
		if (!rooms.length) {
			throw new Error("No rooms found. Run server/scripts/seed_room.js first.");
		}

		if (SEED_RESET) {
			await Promise.all([
				Guest.deleteMany({}),
				Booking.deleteMany({}),
				Bill.deleteMany({}),
				Payment.deleteMany({}),
				Service.deleteMany({}),
				AuditLog.deleteMany({}),
			]);
		}

		const { year, sequence: startingSequence } = await getStartingInvoiceSequence();
		let invoiceSequence = startingSequence;

		const now = new Date();
		const startDate = new Date(now);
		startDate.setDate(startDate.getDate() - (SEED_DAYS - 1));

		const guests = [];
		for (let i = 0; i < Math.ceil(SEED_BOOKINGS * 0.8); i += 1) {
			const guest = new Guest(buildGuestPayload(i + 1));
			guests.push(guest);
		}
		await Guest.insertMany(guests);

		const statusPool = shuffle([
			...Array(Math.round(SEED_BOOKINGS * 0.4)).fill("checked-out"),
			...Array(Math.round(SEED_BOOKINGS * 0.3)).fill("checked-in"),
			...Array(Math.round(SEED_BOOKINGS * 0.2)).fill("booked"),
			...Array(Math.max(1, Math.round(SEED_BOOKINGS * 0.1))).fill("cancelled"),
		]).slice(0, SEED_BOOKINGS);

		const forcedPaidDates = Array.from({ length: Math.min(7, SEED_BOOKINGS) }, (_, idx) => {
			const day = new Date();
			day.setHours(12, 0, 0, 0);
			day.setDate(day.getDate() - (6 - idx));
			return day;
		});

		const serviceDocs = [];
		const paymentDocs = [];
		const bookingDocs = [];
		const billDocs = [];

		for (let i = 0; i < SEED_BOOKINGS; i += 1) {
			const isForcedPaid = i < forcedPaidDates.length;
			const status = isForcedPaid ? "checked-out" : (statusPool[i] || "booked");
			const nights = randInt(1, 4);
			const checkIn = new Date(startDate);
			checkIn.setDate(startDate.getDate() + randInt(0, SEED_DAYS - 1));
			checkIn.setHours(randInt(10, 16), 0, 0, 0);
			const expectedCheckout = new Date(checkIn);
			expectedCheckout.setDate(expectedCheckout.getDate() + nights);
			let checkOut = status === "checked-out" ? new Date(expectedCheckout) : null;

			if (isForcedPaid) {
				checkOut = new Date(forcedPaidDates[i]);
				const forcedCheckIn = new Date(checkOut);
				forcedCheckIn.setDate(forcedCheckIn.getDate() - nights);
				forcedCheckIn.setHours(randInt(10, 12), 0, 0, 0);
				checkIn.setTime(forcedCheckIn.getTime());
				expectedCheckout.setTime(checkOut.getTime());
			}

			const room = pick(rooms);
			const guest = pick(guests);

			const bookingId = new mongoose.Types.ObjectId();
			const billId = new mongoose.Types.ObjectId();

			const serviceCount = status === "cancelled" ? 0 : randInt(0, 3);
			const services = [];
			for (let s = 0; s < serviceCount; s += 1) {
				const servedAt = new Date(checkIn);
				servedAt.setDate(checkIn.getDate() + randInt(0, Math.max(0, nights - 1)));
				const payload = buildServicePayload(bookingId, receptionist._id, servedAt);
				services.push(payload);
			}

			const calc = calculateBill({
				roomPricePerNight: room.price?.per_night,
				nights,
				services,
				discount: rng() > 0.85 ? randInt(200, 800) : 0,
				taxPercent: room.price?.tax_percent,
				applyRounding: true,
			});

			const payableAmount = Number(calc.payableTotal) || Number(calc.total) || 0;
			let amountPaid = 0;
			if (status === "checked-out") {
				amountPaid = payableAmount;
			} else if (status === "checked-in") {
				amountPaid = Math.round(payableAmount * randFloat(0.3, 0.8));
			} else if (status === "booked") {
				amountPaid = Math.round(payableAmount * randFloat(0.1, 0.3));
			}
			amountPaid = Math.min(amountPaid, payableAmount);
			const remainingAmount = Math.max(0, payableAmount - amountPaid);

			const billStatus = amountPaid >= payableAmount && payableAmount > 0
				? "paid"
				: amountPaid > 0
					? "partial"
					: "unpaid";

			const paidAt = checkOut || checkIn;
			const bill = {
				_id: billId,
				booking_id: bookingId,
				room_charge: Number(calc.roomTotal) || 0,
				services_charge: Number(calc.servicesTotal) || 0,
				tax_amount: Number(calc.taxAmount) || 0,
				discount: calc.discount ? { type: "manual", amount: calc.discount } : undefined,
				total_amount: Number(calc.total) || 0,
				roundoff_amount: Number(calc.roundoffAmount) || 0,
				payable_amount: payableAmount,
				amount_paid: amountPaid,
				remaining_amount: remainingAmount,
				status: billStatus,
				invoice_number: buildInvoiceNumber(year, invoiceSequence),
				finalized_at: status === "checked-out" ? checkOut : undefined,
				payments: [],
				createdAt: paidAt,
				updatedAt: paidAt,
			};
			invoiceSequence += 1;

			const booking = {
				_id: bookingId,
				room_id: room._id,
				guest_id: guest._id,
				bill_id: billId,
				check_in_date: checkIn,
				expected_checkout: expectedCheckout,
				check_out_date: checkOut || undefined,
				status,
				booking_source: pick(["walk-in", "online", "OTA", "phone"]),
				advance_paid: amountPaid,
				services: [],
				notes: rng() > 0.8 ? "Late check-in" : "",
				created_by: receptionist._id,
			};

			const payments = buildPayments({
				billId,
				bookingId,
				amountPaid,
				collectedBy: receptionist._id,
				paidAt: checkOut || checkIn,
			});

			billDocs.push(bill);
			bookingDocs.push(booking);
			serviceDocs.push(...services);
			paymentDocs.push(...payments);

			guest.booking_history = guest.booking_history || [];
			guest.booking_history.push(bookingId);
			room.bookings = room.bookings || [];
			room.bookings.push(bookingId);

			if (status === "checked-in") {
				room.availability = "occupied";
			} else if (status === "checked-out") {
				room.availability = "available";
			}
		}

		await Bill.insertMany(billDocs, { timestamps: false });
		await Booking.insertMany(bookingDocs);
		if (serviceDocs.length) {
			const insertedServices = await Service.insertMany(serviceDocs);
			const serviceByBooking = insertedServices.reduce((acc, svc) => {
				const key = svc.booking_id.toString();
				acc[key] = acc[key] || [];
				acc[key].push(svc._id);
				return acc;
			}, {});
			for (const booking of bookingDocs) {
				const svcIds = serviceByBooking[booking._id.toString()] || [];
				if (svcIds.length) {
					await Booking.updateOne({ _id: booking._id }, { $set: { services: svcIds } });
				}
			}
		}
		if (paymentDocs.length) {
			const insertedPayments = await Payment.insertMany(paymentDocs);
			const paymentByBill = insertedPayments.reduce((acc, payment) => {
				const key = payment.bill_id.toString();
				acc[key] = acc[key] || [];
				acc[key].push(payment._id);
				return acc;
			}, {});
			for (const bill of billDocs) {
				const payIds = paymentByBill[bill._id.toString()] || [];
				if (payIds.length) {
					await Bill.updateOne({ _id: bill._id }, { $set: { payments: payIds } });
				}
			}
		}

		await Guest.bulkSave(guests);
		await Room.bulkSave(rooms);

		const maintenanceRooms = shuffle(rooms.filter((room) => room.availability === "available")).slice(0, 3);
		for (const room of maintenanceRooms) {
			room.availability = "maintenance";
		}
		await Room.bulkSave(maintenanceRooms);

		for (const booking of bookingDocs) {
			await logAudit({
				action: booking.status === "cancelled" ? "Booking Cancelled" : "Booking Created",
				entity: "Booking",
				entityId: booking._id,
				performedBy: receptionist._id,
				details: { status: booking.status },
			});
		}

		console.log("✅ Mock data seeded successfully");
		console.log(`Guests: ${guests.length}`);
		console.log(`Bookings: ${bookingDocs.length}`);
		console.log(`Bills: ${billDocs.length}`);
		console.log(`Services: ${serviceDocs.length}`);
		console.log(`Payments: ${paymentDocs.length}`);
		process.exit(0);
	} catch (error) {
		console.error("❌ Mock data seeding failed:", error);
		process.exit(1);
	}
};

seed();

import Bill from "../models/Bill.js";
import Booking from "../models/Booking.js";
import AuditLog from "../models/AuditLog.js";

export const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { status: "paid" };
    
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const report = await Bill.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total_amount" },
          totalRoomCharges: { $sum: "$room_charges" },
          totalServices: { $sum: "$services_total" },
          totalTax: { $sum: "$tax_amount" }
        }
      }
    ]);

    res.json(report[0] || { totalRevenue: 0, totalRoomCharges: 0, totalServices: 0, totalTax: 0 });
  } catch (error) {
    next(error);
  }
};

export const getOccupancyReport = async (req, res, next) => {
  try {
    const report = await Booking.aggregate([
      { $match: { status: { $in: ["checked-in", "booked"] } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getGSTReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { status: "paid", tax_amount: { $gt: 0 } };
    
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const report = await Bill.find(match).select("invoice_number tax_amount total_amount createdAt");
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getAuditLog = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate("performedBy", "name email role")
      .sort("-createdAt")
      .limit(100);
      
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
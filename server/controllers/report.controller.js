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
          totalRevenue: { $sum: "$amount_paid" },
          totalRoomCharges: { $sum: "$room_charge" },
          totalServices: { $sum: "$services_charge" },
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
    const totalBookings = report.reduce((acc, item) => acc + item.count, 0);
    res.json({
      totalBookings,
      byStatus: report.map((item) => ({ status: item._id, count: item.count }))
    });
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

    const [summary] = await Bill.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalGST: { $sum: "$tax_amount" }
        }
      }
    ]);

    const items = await Bill.find(match).select("invoice_number tax_amount total_amount createdAt");
    const totalGST = summary?.totalGST || 0;
    const totalCGST = totalGST / 2;
    const totalSGST = totalGST / 2;

    res.json({
      summary: {
        totalGST,
        totalCGST,
        totalSGST
      },
      items
    });
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
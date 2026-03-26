import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Bill from "../models/Bill.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

export const getReceptionistDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const currentUser = await User.findById(req.user.id);
    let roomFilter = {};
    let bookingRoomFilter = {};
    
    if (currentUser?.hotel) {
      roomFilter = { hotel: currentUser.hotel };
      const rooms = await Room.find(roomFilter).select('_id');
      const roomIds = rooms.map(r => r._id);
      bookingRoomFilter = { room_id: { $in: roomIds } };
    }

    // 1. Pending Arrivals (status: "booked")
    const pendingArrivals = await Booking.find({
      status: "booked",
      ...bookingRoomFilter
    })
      .populate("guest_id")
      .populate("room_id")
      .sort({ createdAt: 1 });

    // 2. In-House Guests (status: "checked-in")
    const inHouse = await Booking.find({
      status: "checked-in",
      ...bookingRoomFilter
    })
      .populate("guest_id")
      .populate("room_id")
      .sort({ check_in_date: -1 });

    // 3. Today's Departures (status: "checked-in" and expected_checkout <= todayEnd)
    const todaysDepartures = await Booking.find({
      status: "checked-in",
      expected_checkout: { $lte: todayEnd },
      ...bookingRoomFilter
    })
      .populate("guest_id")
      .populate("room_id")
      .sort({ expected_checkout: 1 });

    // 4. Room Status summary
    const roomStats = await Room.aggregate([
      { $match: roomFilter },
      {
        $group: {
          _id: "$availability",
          count: { $sum: 1 },
        },
      },
    ]);

    const roomStatus = {
      available: 0,
      occupied: 0,
      maintenance: 0,
      total: 0,
    };

    roomStats.forEach((stat) => {
      if (roomStatus.hasOwnProperty(stat._id)) {
        roomStatus[stat._id] = stat.count;
      }
      roomStatus.total += stat.count;
    });

    res.status(200).json({
      pendingArrivals,
      inHouse,
      todaysDepartures,
      roomStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Total Revenue Today
    const todaysBills = await Bill.find({
      status: "paid",
      updatedAt: { $gte: todayStart, $lte: todayEnd },
    });
    const totalRevenueToday = todaysBills.reduce((acc, bill) => acc + bill.amount_paid, 0);

    const previousDayStart = new Date(todayStart);
    previousDayStart.setDate(previousDayStart.getDate() - 1);
    const previousDayEnd = new Date(todayEnd);
    previousDayEnd.setDate(previousDayEnd.getDate() - 1);
    
    const yesterdaysBills = await Bill.find({
      status: "paid",
      updatedAt: { $gte: previousDayStart, $lte: previousDayEnd },
    });
    const totalRevenueYesterday = yesterdaysBills.reduce((acc, bill) => acc + bill.amount_paid, 0);
    const revenueTrendPercent = totalRevenueYesterday === 0 
        ? (totalRevenueToday > 0 ? 100 : 0) 
        : Math.round(((totalRevenueToday - totalRevenueYesterday) / totalRevenueYesterday) * 100);

    // 2. Total Bookings (Active)
    const totalBookings = await Booking.countDocuments({
      status: { $in: ["booked", "checked-in"] },
    });

    // 3. Occupancy Rate
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ availability: "occupied" });
    const occupancyRate = totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100);

    // 4. Active Staff
    const totalStaff = await User.countDocuments({ role: { $in: ["admin", "receptionist", "manager"] } });
    const activeStaff = await User.countDocuments({ role: { $in: ["admin", "receptionist", "manager"] }, isActive: true });

    // 5. Revenue Trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 7 days including today
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const billsLast7Days = await Bill.find({
      status: "paid",
      updatedAt: { $gte: sevenDaysAgo },
    });

    const revenueTrend = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const dayStart = new Date(d);
        dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23,59,59,999);

        const daysBills = billsLast7Days.filter(b => b.updatedAt >= dayStart && b.updatedAt <= dayEnd);
        const roomRevenue = daysBills.reduce((sum, b) => sum + (b.room_charge || 0), 0);
        const serviceRevenue = daysBills.reduce((sum, b) => sum + (b.services_charge || 0), 0);
        const taxRevenue = daysBills.reduce((sum, b) => sum + (b.tax_amount || 0), 0);
        const total = daysBills.reduce((sum, b) => sum + (b.amount_paid || 0), 0);
        
        revenueTrend.push({
          day: dayName,
          roomRevenue,
          serviceRevenue,
          taxRevenue,
          total
        });
    }

    // 6. Occupancy by Category
    const roomStatsAdmin = await Room.aggregate([
      {
        $group: {
          _id: { category: "$room_category", availability: "$availability" },
          count: { $sum: 1 },
        },
      },
    ]);
    
    const occupancyByCategory = {
        standard: { total: 0, occupied: 0 },
        deluxe: { total: 0, occupied: 0 },
        suite: { total: 0, occupied: 0 }
    };
    
    roomStatsAdmin.forEach(stat => {
        const category = stat._id.category;
        if (occupancyByCategory[category]) {
            occupancyByCategory[category].total += stat.count;
            if (stat._id.availability === "occupied") {
                occupancyByCategory[category].occupied += stat.count;
            }
        }
    });

    const categoryOccupancy = Object.keys(occupancyByCategory).map(key => {
        const cat = occupancyByCategory[key];
        return {
            category: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize
            rate: cat.total === 0 ? 0 : Math.round((cat.occupied / cat.total) * 100)
        };
    });

    // 7. Recent Activity (Audit logs)
    const recentActivity = await AuditLog.find()
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(5);

    // 8. Staff Status
    const staffStatus = await User.find({ role: { $in: ["admin", "receptionist", "manager"] } })
      .select("name role isActive lastLogin")
      .sort({ lastLogin: -1 })
      .limit(10);

    res.status(200).json({
      totalRevenueToday,
      revenueTrendPercent,
      totalBookings,
      occupancyRate,
      activeStaff: { active: activeStaff, total: totalStaff },
      revenueTrend,
      categoryOccupancy,
      recentActivity,
      staffStatus
    });

  } catch (error) {
    next(error);
  }
};

import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

export const getReceptionistDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Pending Arrivals (status: "booked")
    const pendingArrivals = await Booking.find({
      status: "booked",
    })
      .populate("guest_id")
      .populate("room_id")
      .sort({ createdAt: 1 });

    // 2. In-House Guests (status: "checked-in")
    const inHouse = await Booking.find({
      status: "checked-in",
    })
      .populate("guest_id")
      .populate("room_id")
      .sort({ check_in_date: -1 });

    // 3. Today's Departures (status: "checked-in" and expected_checkout <= todayEnd)
    const todaysDepartures = await Booking.find({
      status: "checked-in",
      expected_checkout: { $lte: todayEnd },
    })
      .populate("guest_id")
      .populate("room_id")
      .sort({ expected_checkout: 1 });

    // 4. Room Status summary
    const roomStats = await Room.aggregate([
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

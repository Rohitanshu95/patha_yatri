import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location:{
        address: { type: String, required: true },
        description: { type: String },
        map_location:{ type: String }
    },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receptionists: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    proximity:{
        airport: { type: Number },
        bus_station: { type: Number },
        train_station: { type: Number }
    },
    phone: [{ type: String }],
    website: { type: String },
    amenities: [{ type: String }],
    photos: [{ type: String }],
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    booking: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
});

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
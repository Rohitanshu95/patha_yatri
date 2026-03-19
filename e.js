const Booking = {
  room_id: String,
  Services: [
    {
      type: "fooding",
      name: "Biriyani",
      price: 200,
    },
    {
      type: "laundry",
      name: "Shirt Washing",
      price: 50,
    },
    {
      type: "spa",
      name: "Full Body Massage",
      price: 500,
    },
  ],
  bill: {
    room_charge: 1000,
    services_charge: 750,
    tax: 175,
    Discount: {
      type: "seasonal",
      amount: 100,
    },
    total_amount: 1825,
    remaining_amount: 0,
    status: ["paid", "unpaid", "partial"],
    payment: {
      method: ["cash", "card", "UPI"],
    },
  },
  guest: {
    name: "John Doe",
    contact: "+1234567890",
    email: "johndoe@example.com",
    address: "",
    documents: {
      id_proof: "Aadhar Card",
      number: "1234-5678-9012",
      file_url: "https://example.com/documents/aadhar_johndoe.pdf",
    },
    occupants: {
      total: 5,
      adults: {
        count: 3,
        male: 2,
        female: 1,
      },
      children: 2,
    },
  },
  status: ["booked", "checked-in", "checked-out", "cancelled"],
};

const Room = {
    id: String,
    name: String,
    room_category: ["standard", "deluxe", "suite"],
    availibility: ["available", "occupied", "maintenance"],
    price:{
        per_night: Number,
        per_hour: Number,
        tax: Number,
    },
    bookings: [Booking],
}

const services = {
    type:["fooding", "laundry", "spa", "other"],
    name: String,
    quantity: Number,
    unit_price: Number,
    total_price: Number,
    description: String,
}
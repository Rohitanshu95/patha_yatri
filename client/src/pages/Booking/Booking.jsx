import React from 'react'
import ReceptionistBooking from '../Receptionist/ReceptionistBooking';

const Booking = () => {
  const { user } = useAuthStore();

  if (user?.role === "receptionist") {
    return <ReceptionistBooking />;
  }
}

export default Booking
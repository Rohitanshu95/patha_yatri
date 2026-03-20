import React, { useEffect, useState } from "react";
import { useRoomStore } from "../../store/roomStore";

const RoomManagement = () => {
  const { rooms, isLoading, fetchRooms, createRoom } = useRoomStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    name: "",
    room_category: "standard",
    availability: "available",
    price_per_night: "",
    tax_percent: "",
    max_occupants: 2,
    images: null,
  });

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleChange = (e) => {
    if (e.target.name === "images") {
      setFormData({ ...formData, images: e.target.files });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("room_number", formData.room_number);
    data.append("name", formData.name);
    data.append("room_category", formData.room_category);
    data.append("availability", formData.availability);
    data.append("price_per_night", formData.price_per_night);
    data.append("tax_percent", formData.tax_percent);
    data.append("max_occupants", formData.max_occupants);
    if (formData.images) {
      for (let i = 0; i < formData.images.length; i++) {
        data.append("images", formData.images[i]);
      }
    }

    const success = await createRoom(data);
    if (success) {
      setIsModalOpen(false);
      setFormData({ room_number: "", name: "", room_category: "standard", availability: "available", price_per_night: "", tax_percent: "", max_occupants: 2, images: null });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Room Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Room
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 border-b">
              <th className="p-4">Room Number</th>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price / Night</th>
              <th className="p-4">Max Occupants</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">Loading...</td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">No rooms found.</td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{room.room_number}</td>
                  <td className="p-4">{room.name}</td>
                  <td className="p-4 capitalize">{room.room_category}</td>
                  <td className="p-4">₹{room.price?.per_night}</td>
                  <td className="p-4">{room.max_occupants}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${room.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {room.availability}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative p-8 bg-white w-full max-w-md m-auto rounded-xl shadow-lg">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold">Add New Room</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                 <input type="text" name="room_number" required value={formData.room_number} onChange={handleChange} className="w-full border rounded-lg p-2" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                 <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border rounded-lg p-2" placeholder="e.g. Deluxe King Suite" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                 <select name="room_category" value={formData.room_category} onChange={handleChange} className="w-full border rounded-lg p-2">
                   <option value="standard">Standard</option>
                   <option value="deluxe">Deluxe</option>
                   <option value="suite">Suite</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                 <select name="availability" value={formData.availability} onChange={handleChange} className="w-full border rounded-lg p-2">
                   <option value="available">Available</option>
                   <option value="occupied">Occupied</option>
                   <option value="maintenance">Maintenance</option>
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Night (₹)</label>
                   <input type="number" name="price_per_night" required value={formData.price_per_night} onChange={handleChange} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                   <input type="number" name="tax_percent" required value={formData.tax_percent} onChange={handleChange} className="w-full border rounded-lg p-2" placeholder="e.g. 18" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Max Occupants</label>
                 <input type="number" name="max_occupants" required value={formData.max_occupants} onChange={handleChange} className="w-full border rounded-lg p-2" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Room Images</label>
                 <input type="file" name="images" multiple onChange={handleChange} className="w-full border rounded-lg p-2" />
               </div>
               <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Room'}</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;

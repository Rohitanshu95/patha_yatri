import React, { useEffect, useState } from "react";
import { useGuestStore } from "../../store/guestStore";

const GuestManagement = () => {
  const { guests, isLoading, fetchGuests, registerGuest } = useGuestStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    id_proof: "Aadhaar",
    document_number: "",
    occupants_children: 0,
    occupants_adults_male: 1,
    occupants_adults_female: 0,
    identityProof: null
  });

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const handleChange = (e) => {
    if (e.target.name === "identityProof") {
      setFormData({ ...formData, identityProof: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("contact", formData.contact);
    data.append("address", formData.address);
    data.append("id_proof", formData.id_proof);
    data.append("document_number", formData.document_number);
    data.append("occupants_children", formData.occupants_children);
    data.append("occupants_adults_male", formData.occupants_adults_male);
    data.append("occupants_adults_female", formData.occupants_adults_female);
    if (formData.identityProof) {
      data.append("id_proof_file", formData.identityProof);
    }

    const success = await registerGuest(data);
    if (success) {
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        contact: "",
        address: "",
        id_proof: "Aadhaar",
        document_number: "",
        occupants_children: 0,
        occupants_adults_male: 1,
        occupants_adults_female: 0,
        identityProof: null
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Guest Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Guest
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 border-b">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Address</th>
              <th className="p-4">ID Proof</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
            ) : guests.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center">No guests found.</td></tr>
            ) : (
              guests.map((guest) => (
                <tr key={guest._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{guest.name}</td>
                  <td className="p-4">{guest.email}</td>
                  <td className="p-4">{guest.contact}</td>
                  <td className="p-4">{guest.address}</td>
                  <td className="p-4">{guest.documents?.file_url ? <a href={guest.documents.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View ID</a> : "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed flex inset-0 bg-black/50 overflow-y-auto h-full w-full items-center justify-center p-4">
          <div className="relative p-8 bg-white w-full max-w-md m-auto rounded-xl shadow-lg">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold">Register New Guest</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                   <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID File</label>
                   <input type="file" name="identityProof" required onChange={handleChange} className="w-full border rounded-lg p-2" />
                 </div>
               </div>
               <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-1">
                   <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                   <select name="id_proof" required value={formData.id_proof} onChange={handleChange} className="w-full border rounded-lg p-2">
                     <option value="Aadhaar">Aadhaar</option>
                     <option value="Passport">Passport</option>
                     <option value="Driving License">Driving License</option>
                     <option value="Voter ID">Voter ID</option>
                   </select>
                 </div>
                 <div className="col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">ID Document Number</label>
                   <input type="text" name="document_number" required value={formData.document_number} onChange={handleChange} className="w-full border rounded-lg p-2" />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                   <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                   <input type="text" name="contact" required value={formData.contact} onChange={handleChange} className="w-full border rounded-lg p-2" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                 <textarea name="address" required value={formData.address} onChange={handleChange} className="w-full border rounded-lg p-2" rows="2"></textarea>
               </div>
               <div className="grid grid-cols-3 gap-4 border-t pt-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Male Adults</label>
                   <input type="number" min="0" name="occupants_adults_male" required value={formData.occupants_adults_male} onChange={handleChange} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Female Adults</label>
                   <input type="number" min="0" name="occupants_adults_female" required value={formData.occupants_adults_female} onChange={handleChange} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                   <input type="number" min="0" name="occupants_children" required value={formData.occupants_children} onChange={handleChange} className="w-full border rounded-lg p-2" />
                 </div>
               </div>
               <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={isLoading}>{isLoading ? 'Saving...' : 'Register Guest'}</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestManagement;

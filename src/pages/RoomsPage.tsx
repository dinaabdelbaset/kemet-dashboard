import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { Plus, Edit, Trash2, Bed } from "lucide-react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, hotel_id: "", room_type: "", price_per_night: "", capacity_adults: "", available_count: "", image: "", description: "" });
  const [selectedLocation, setSelectedLocation] = useState('All');

  const fetchRooms = () => axiosClient.get("/admin/rooms").then((res) => setRooms(res.data));
  const fetchHotels = () => axiosClient.get("/admin/hotels").then((res) => setHotels(res.data));

  useEffect(() => {
    fetchRooms();
    fetchHotels();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: null, hotel_id: hotels[0]?.id || "", room_type: "", price_per_night: "", capacity_adults: "", available_count: "", image: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (room: any) => {
    setIsEditing(true);
    setFormData({ 
      id: room.id, 
      hotel_id: room.hotel_id, 
      room_type: room.room_type, 
      price_per_night: room.price_per_night, 
      capacity_adults: room.capacity_adults,
      available_count: room.available_count,
      image: room.image || "",
      description: room.description || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosClient.put(`/admin/rooms/${formData.id}`, formData);
      } else {
        await axiosClient.post(`/admin/rooms`, formData);
      }
      closeModal();
      fetchRooms();
    } catch (err) {
      alert("Error saving room!");
    }
  };

  const deleteRoom = async (id: number) => {
    if (confirm("Are you sure you want to delete this room?")) {
      await axiosClient.delete(`/admin/rooms/${id}`);
      fetchRooms();
    }
  };

  const uniqueLocations = ['All', ...new Set(rooms.map(r => r.hotel?.location).filter(Boolean))];
  const filteredItems = selectedLocation === 'All' ? rooms : rooms.filter(r => r.hotel?.location === selectedLocation);

  const groupedRooms = filteredItems.reduce((acc: any, room: any) => {
    const hotelName = room.hotel?.title || room.hotel?.name || 'Unknown Hotel';
    if (!acc[hotelName]) acc[hotelName] = [];
    acc[hotelName].push(room);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-slate-800">Manage Rooms</h2>
         <div className="flex gap-4 items-center">
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="p-2 border border-slate-200 rounded-lg shadow-sm font-medium outline-none text-slate-700 bg-white">
               {uniqueLocations.map(loc => <option key={loc as string} value={loc as string}>{loc === 'All' ? 'All Locations' : loc}</option>)}
            </select>
            <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition">
               <Plus size={20} /> Add New Room
            </button>
         </div>
      </div>

      <div className="space-y-12">
         {Object.entries(groupedRooms).map(([hotelName, hotelRooms]: [string, any]) => (
            <div key={hotelName}>
               <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
                  <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-slate-800">{hotelName}</h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{hotelRooms.length} Rooms</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotelRooms.map((room: any) => (
                     <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group">
                        <img src={room.image ? (room.image.startsWith('/') ? 'http://localhost:5173' + room.image : room.image) : 'https://via.placeholder.com/400'} alt={room.room_type} className="w-full h-48 object-cover" />
                        <div className="p-5 flex-1 flex flex-col">
                           <h3 className="font-bold text-lg text-slate-800 mb-1">{room.room_type}</h3>
                           
                           <div className="flex gap-4 text-sm text-slate-600 mb-4 mt-2 font-medium">
                              <span className="flex items-center gap-1"><Bed size={16}/> {room.capacity_adults} Adults</span>
                              <span>Qty: {room.available_count}</span>
                           </div>

                           <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                              <span className="font-bold text-amber-600">{room.price_per_night} EGP</span>
                              <div className="flex gap-2">
                                  <button onClick={() => openEditModal(room)} className="text-blue-500 bg-blue-50 p-2 rounded-lg transition border border-blue-100 hover:text-blue-700">
                                     <Edit size={18} />
                                  </button>
                                  <button onClick={() => deleteRoom(room.id)} className="text-red-500 bg-red-50 p-2 rounded-lg transition border border-red-100 hover:text-red-700">
                                     <Trash2 size={18} />
                                  </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ))}
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <h3 className="text-xl font-bold text-slate-800">{isEditing ? "Edit Room" : "Add Room"}</h3>
                   <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">✕</button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 space-y-4">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Select Hotel</label>
                       <select required value={formData.hotel_id} onChange={e => setFormData({...formData, hotel_id: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500 bg-white">
                           {hotels.map(h => <option key={h.id} value={h.id}>{h.title || h.name}</option>)}
                       </select>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
                       <input required type="text" value={formData.room_type} onChange={e => setFormData({...formData, room_type: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Deluxe Double Room" />
                   </div>
                   <div className="flex gap-4">
                       <div className="flex-1">
                           <label className="block text-sm font-medium text-slate-700 mb-1">Price / Night</label>
                           <input required type="number" value={formData.price_per_night} onChange={e => setFormData({...formData, price_per_night: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. 500" />
                       </div>
                       <div className="flex-1">
                           <label className="block text-sm font-medium text-slate-700 mb-1">Adults Capacity</label>
                           <input required type="number" value={formData.capacity_adults} onChange={e => setFormData({...formData, capacity_adults: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. 2" />
                       </div>
                   </div>
                   <div className="flex gap-4">
                       <div className="flex-1">
                           <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                           <input required type="number" value={formData.available_count} onChange={e => setFormData({...formData, available_count: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. 10" />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                       <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="Room description..." rows={3}></textarea>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                       <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="/images/hotels/..." />
                   </div>
                   <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-slate-100">
                       <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
                       <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition">Save Room</button>
                   </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}

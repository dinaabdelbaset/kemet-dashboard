import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, X } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, status: "pending" });

  const fetchBookings = () => {
    axiosClient.get("/admin/bookings").then((res) => setBookings(res.data));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openEditModal = (booking: any) => {
    setFormData({ id: booking.id, status: booking.status });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/admin/bookings/${formData.id}`, { status: formData.status });
      closeModal();
      fetchBookings();
    } catch (err) {
      alert("Error updating booking!");
    }
  };

  const deleteBooking = async (id: number) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      await axiosClient.delete(`/admin/bookings/${id}`);
      fetchBookings();
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-slate-800">Manage Bookings</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 font-semibold text-slate-600">ID</th>
              <th className="p-4 font-semibold text-slate-600">User</th>
              <th className="p-4 font-semibold text-slate-600">Type</th>
              <th className="p-4 font-semibold text-slate-600">Item Title</th>
              <th className="p-4 font-semibold text-slate-600">Total Price</th>
              <th className="p-4 font-semibold text-slate-600">Profit Details</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="p-4 text-slate-500">#{booking.id}</td>
                <td className="p-4 font-medium text-slate-800">{booking.user?.first_name || 'Guest'}</td>
                <td className="p-4 text-slate-500 uppercase text-xs font-bold tracking-wider">{booking.booking_type}</td>
                <td className="p-4 font-medium text-amber-600">{booking.item_title}</td>
                <td className="p-4 font-bold text-slate-800">{booking.total_price} $</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-green-600">
                      Kemet Profit: {booking.platform_profit || 0} $ ({booking.commission_percentage || '0%'})
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Partner Share: {booking.partner_share || booking.total_price} $
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(booking)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => deleteBooking(booking.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-500">No bookings found.</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
               <div className="flex justify-between items-center p-6 border-b border-slate-100">
                   <h3 className="text-xl font-bold text-slate-800">Update Booking Status</h3>
                   <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2">Booking Status</label>
                       <select 
                         value={formData.status} 
                         onChange={e => setFormData({...formData, status: e.target.value})} 
                         className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-amber-500 bg-white"
                       >
                         <option value="pending">Pending</option>
                         <option value="confirmed">Confirmed</option>
                         <option value="cancelled">Cancelled</option>
                       </select>
                   </div>
                   <div className="mt-4 flex justify-end gap-3">
                       <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
                       <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition">Save Status</button>
                   </div>
               </form>
           </div>
        </div>
      )}
    </div>
  );
}

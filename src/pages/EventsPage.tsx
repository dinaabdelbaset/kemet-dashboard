import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, Plus, X } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, title: "", location: "", date: "", category: "", image: "" });

  const fetchEvents = () => {
    axiosClient.get("/admin/events").then((res) => setEvents(res.data));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: null, title: "", location: "", date: "", category: "", image: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (event: any) => {
    setIsEditing(true);
    setFormData({ 
      id: event.id, 
      title: event.title, 
      location: event.location, 
      date: event.date || "", 
      category: event.category || "",
      image: event.image 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosClient.put(`/admin/events/${formData.id}`, formData);
      } else {
        await axiosClient.post(`/admin/events`, formData);
      }
      closeModal();
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert("Error saving event!");
    }
  };

  const deleteEvent = async (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await axiosClient.delete(`/admin/events/${id}`);
      fetchEvents();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-slate-800">Manage Events</h2>
         <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition">
            <Plus size={20} /> Add New Event
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group">
               <img src={event.image ? (event.image.startsWith('/') ? 'http://localhost:5173' + event.image : event.image) : 'https://via.placeholder.com/400'} alt={event.title} className="w-full h-48 object-cover" />
               <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{event.title}</h3>
                  <p className="text-slate-500 text-sm mb-2 line-clamp-2" title={event.location}>{event.location}</p>
                  
                  {event.category && (
                     <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md mb-4 self-start">
                        {event.category}
                     </span>
                  )}
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                     <span className="font-bold text-amber-600 truncate max-w-[150px]">{event.date || 'TBA'}</span>
                     <div className="flex gap-2">
                         <button onClick={() => openEditModal(event)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                            <Edit size={18} />
                         </button>
                         <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
                            <Trash2 size={18} />
                         </button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
         {events.length === 0 && <p className="col-span-3 text-center text-slate-500 p-8">No events found.</p>}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
               <div className="flex justify-between items-center p-6 border-b border-slate-100">
                   <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Event' : 'Add New Event'}</h3>
                   <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
                       <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Pyramids Day Event" />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                       <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Giza" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                           <input type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Oct 20 - Nov 5" />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                           <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Festival" />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                       <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. /images/..." />
                   </div>
                   <div className="mt-4 flex justify-end gap-3">
                       <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
                       <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition">Save Event</button>
                   </div>
               </form>
           </div>
        </div>
      )}
    </div>
  );
}
